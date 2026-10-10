
const { spawn, exec } = require('child_process');
const { randomUUID } = require('crypto');

const {
  TIMEOUT_MS,
  MEMORY_LIMIT,
  CPU_LIMIT,
  PIDS_LIMIT,
  MAX_OUTPUT_LENGTH,
  MAX_CODE_LENGTH
} = require('./limits');

// Check whether Docker is running
const checkDockerAvailable = () => {
  return new Promise((resolve) => {
    exec('docker info', { timeout: 10000 }, (error) => {
      resolve(!error);
    });
  });
};

// Run code inside an isolated Docker container
const runInDocker = async (language, code) => {
  if (typeof code !== 'string') {
    return {
      success: false,
      stdout: '',
      stderr: 'Invalid code input.',
      executionTime: 0
    };
  }

  if (code.length > MAX_CODE_LENGTH) {
    return {
      success: false,
      stdout: '',
      stderr: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters.`,
      executionTime: 0
    };
  }

  const supportedLanguages = [
    'javascript',
    'python',
    'cpp'
  ];

  if (!supportedLanguages.includes(language)) {
    return {
      success: false,
      stdout: '',
      stderr: `Unsupported language: ${language}`,
      executionTime: 0
    };
  }

  const isDockerReady = await checkDockerAvailable();

  if (!isDockerReady) {
    return {
      success: false,
      stdout: '',
      stderr:
        'Docker is unavailable. Start Docker Desktop and try again.',
      executionTime: 0
    };
  }

  return new Promise((resolve) => {
    const containerName = `code-runner-${randomUUID()}`;

    const baseSecurityArgs = [
      'run',
      '--name', containerName,
      '-i',
      '--rm',
      '--network', 'none',
      '--memory', MEMORY_LIMIT,
      '--cpus', String(CPU_LIMIT),
      '--pids-limit', String(PIDS_LIMIT),
      '--cap-drop', 'ALL',
      '--security-opt', 'no-new-privileges:true',
      '--user', '1000:1000'
    ];

    let dockerArgs;

    if (language === 'javascript') {
      dockerArgs = [
        ...baseSecurityArgs,
        '--tmpfs', '/tmp:rw,noexec,nosuid,size=64m',
        'node:20-alpine',
        'node', '-'
      ];
    } else if (language === 'python') {
      dockerArgs = [
        ...baseSecurityArgs,
        '--tmpfs', '/tmp:rw,noexec,nosuid,size=64m',
        'python:3.11-alpine',
        'python', '-u', '-'
      ];
    } else {
      dockerArgs = [
        ...baseSecurityArgs,
        '--tmpfs', '/tmp:rw,exec,nosuid,size=64m',
        'gcc:latest',
        'sh', '-c',
        'cat > /tmp/code.cpp && ' +
        'g++ -O2 -std=c++17 /tmp/code.cpp -o /tmp/code.out && ' +
        '/tmp/code.out'
      ];
    }

    const startTime = Date.now();
    let stdoutData = '';
    let stderrData = '';
    let timedOut = false;
    let outputExceeded = false;
    let settled = false;

    const child = spawn('docker', dockerArgs, {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      resolve({
        ...result,
        executionTime: Date.now() - startTime
      });
    };

    const timer = setTimeout(() => {
      timedOut = true;

      // Kill the actual container, not only the Docker CLI.
      exec(
        `docker kill ${containerName}`,
        { timeout: 5000 },
        () => {
          if (child.exitCode === null) {
            child.kill();
          }
        }
      );

      // Ensure the request eventually finishes.
      setTimeout(() => {
        if (!settled) {
          child.kill();
          finish({
            success: false,
            stdout: stdoutData,
            stderr: `Execution timed out after ${TIMEOUT_MS / 1000}s. Process terminated.`
          });
        }
      }, 6000);
    }, TIMEOUT_MS);

    const appendOutput = (current, chunk) => {
      const remaining = MAX_OUTPUT_LENGTH - current.length;
      return current + chunk.toString().slice(0, Math.max(0, remaining));
    };

    child.stdout.on('data', (chunk) => {
      stdoutData = appendOutput(stdoutData, chunk);
    });

    child.stderr.on('data', (chunk) => {
      stderrData = appendOutput(stderrData, chunk);
    });

    child.stdin.on('error', () => {
      // The container may exit before all input is written.
    });

    child.on('error', (error) => {
      finish({
        success: false,
        stdout: stdoutData,
        stderr: `Failed to start Docker: ${error.message}`
      });
    });

    child.on('close', (exitCode) => {
      if (settled) return;

      if (timedOut) {
        finish({
          success: false,
          stdout: stdoutData,
          stderr: `Execution timed out after ${TIMEOUT_MS / 1000}s. Process terminated.`
        });
        return;
      }

      if (outputExceeded) {
        finish({
          success: false,
          stdout: stdoutData,
          stderr: 'Output limit exceeded.'
        });
        return;
      }

      if (exitCode !== 0 && !stderrData) {
        stderrData = `Process exited with code ${exitCode}`;
      }

      finish({
        success: exitCode === 0,
        stdout: stdoutData,
        stderr: stderrData
      });
    });

    // Write code after handlers are registered.
    child.stdin.end(code);
  });
};

module.exports = {
  runInDocker,
  checkDockerAvailable
};

