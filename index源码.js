const port = process.env.SERVER_PORT || process.env.PORT || 3000;
const vmms = process.env.VPATH || 'vls-123456';
const vmmport = process.env.VL_PORT || '8002';
const vmpath = process.env.MPATH || 'vms-3456789';
const vmport = process.env.VM_PORT || '8001';
const xieyi = process.env.XIEYI || 'vms';
const uuid = process.env.UUID || '3a8a1de5-7d41-45e2-88fe-0f538b822169';
const youxuan = process.env.CF_IP || 'ip.sb';
const sub_name = process.env.SUB_NAME || 'GitHub'; // 订阅名称
const sub_url = process.env.SUB_URL || '';
const baohuo = process.env.BAOHUO_URL || ''; // 保活网址
const nezhaser = process.env.NSERVER || 'v1.xuexi365.eu.org:443';
const nezhaKey = process.env.NKEY || 'KL6Nu7RSxyiGTUFUM8OxS5PIBqxdeiiz';  // 哪吒密钥兼订阅密钥
const nezport = process.env.NPORT || '443';
const neztls = process.env.NTLS || '--tls';
const filePath = process.env.FILE_PATH || '/tmp/';
const tok = process.env.TOK || '';// 隧道token
let host_name = '';
if (tok) {
   host_name = process.env.DOM || '';// 隧道域名
}
// Condition to check if nezhaser includes a port, which triggers the new logic
const nezhaHasPort = nezhaser.includes(':');

const crypto = require("crypto");

// Generate AGENT_UUID based on the provided logic
const seed = `${sub_name}${uuid}${nezhaser}${nezhaKey}${tok}`;
const hash = crypto.createHash('sha256').update(seed).digest('hex');
const AGENT_UUID1 = `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
const AGENT_UUID = process.env.AGENT_UUID || AGENT_UUID1 || 'fraewrwdf-das-2sd2-4324-f232df';



// 哪吒下载链接 (Defaults)
const NEZHA_URL_X64 = process.env.NEZHA_URL_X64 || 'https://github.com/Fscarmon/flies/releases/latest/download/agent-linux_amd64';
const NEZHA_URL_ARM64 = process.env.NEZHA_URL_ARM64 || 'https://github.com/Fscarmon/flies/releases/latest/download/agent-linux_arm64';
const NEZHA_URL_BSD = process.env.NEZHA_URL_BSD || 'https://github.com/Fscarmon/flies/releases/latest/download/agent-freebsd_amd64';

// Alternative Nezha download links (used if nezhaser has a port)
const NEZHA_URL_X64_ALT = process.env.NEZHA_URL_X64_ALT || 'https://github.com/Fscarmon/flies/releases/latest/download/agent2-linux_amd64';
const NEZHA_URL_ARM64_ALT = process.env.NEZHA_URL_ARM64_ALT || 'https://github.com/Fscarmon/flies/releases/latest/download/agent2-linux_arm64';
const NEZHA_URL_BSD_ALT = process.env.NEZHA_URL_BSD_ALT || 'https://github.com/Fscarmon/flies/releases/latest/download/agent2-freebsd_amd64';


// WEB下载链接
const WEB_URL_X64 = process.env.WEB_URL_X64 || 'https://github.com/dsadsadsss/1/releases/download/xry/kano-yuan';
const WEB_URL_ARM64 = process.env.WEB_URL_ARM64 || 'https://github.com/dsadsadsss/1/releases/download/xry/kano-yuan-arm';
const WEB_URL_BSD = process.env.WEB_URL_BSD || 'https://github.com/dsadsadsss/1/releases/download/xry/kano-bsd';

// CFF下载链接
const CFF_URL_X64 = process.env.CFF_URL_X64 || 'https://github.com/Fscarmon/flies/releases/latest/download/cff-linux-amd64';
const CFF_URL_ARM64 = process.env.CFF_URL_ARM64 || 'https://github.com/Fscarmon/flies/releases/latest/download/cff-linux-arm64';
const CFF_URL_BSD = process.env.CFF_URL_BSD || 'https://github.com/dsadsadsss/1/releases/download/xry/argo-bsdamd';

// 下载的文件名称
const WEB_FILENAME = process.env.WEB_FILENAME || 'webdav';
const NEZHA_FILENAME = process.env.NEZHA_FILENAME || 'nexus';
const CFF_FILENAME = process.env.CFF_FILENAME || 'cfloat';

const vport = xieyi === 'vms' ? vmport : vmmport;
const express = require("express");
const app = express();
const exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
const request = require("request");
const fs = require("fs");
const path = require("path");
const axios = require('axios');

// 打印消息到控制台
console.log(`==============================`);
console.log(``);
console.log("     /info 系统信息");
console.log("     /start 检查进程");
console.log(`     /${uuid} 订阅`);
console.log(``);
console.log(`==============================`);

app.get("/", function (req, res) {
    res.send("hello world");
});

let countryCode = '未知';
let up_url = '';
let encodedUrl = '';

function getCountryName(callback) {
    exec('curl -s https://ip.xuexi365.eu.org', (error, stdout, stderr) => {
        if (error) {
            console.error(`获取国家名称失败: ${stderr}`);
            callback('未知');
            return;
        }
        
        const name = stdout.trim();
        if (name && name.length > 0) {
            callback(name);
        } else {
            console.error('获取的国家名称为空');
            callback('未知');
        }
    });
}

getCountryName(code => {
	countryCode = code;
});
let lastHostName = '';
let lastSentTime = 0;

function checkHostNameChange(callback) {
    if (!tok) {
        exec(`grep -oE "https://.*[a-z]+cloudflare.com" ${filePath}/argo.log | tail -n 1 | sed "s#https://##"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error getting host_name: ${error}`);
                return callback();
            }
            const newHostName = stdout.trim();
            if (newHostName && newHostName !== lastHostName) {
                console.log(`host_name set to ${newHostName}`);
                host_name = newHostName;
                lastHostName = newHostName;
                buildUrls();
            }
            callback();
        });
    } else {
        callback();
    }
}

function generateVmessLink() {
  const config = {
    v: "2",
    ps: `${countryCode}-${sub_name}`,
    add: youxuan,
    port: "443",
    id: uuid,
    aid: "0",
    net: "ws",
    type: "none",
    host: host_name,
    path: "/" + vmpath + "?ed=2048",
    tls: "tls",
    sni: host_name,
    alpn: ""
  };
  
  const jsonString = JSON.stringify(config);
  return "vmess://" + Buffer.from(jsonString).toString('base64');
}

function buildUrls() {
    if (xieyi === "vms") {
        up_url = generateVmessLink();
        encodedUrl = up_url;
    } else {
        const pass = "{PASS}"; 
        up_url = `${pass}://${uuid}@${youxuan}:443?path=%2F${vmms}%3Fed%3D2048&security=tls&encryption=none&host=${host_name}&type=ws&sni=${host_name}#${countryCode}-${sub_name}`;
        up_url = up_url.replace("{PA", "vl").replace("SS}", "ess");
        encodedUrl = Buffer.from(up_url).toString('base64');
    }
}
function initializeData() {
    getCountryName((name) => {
        if (name) {
            countryCode = name;
            console.log('使用国家名称:', countryCode);
            checkHostNameChange(() => {
                buildUrls();
            });
        } else {
            console.error('获取国家名称失败，使用默认值"未知"');
            countryCode = '未知';
            checkHostNameChange(() => {
                buildUrls();
            });
        }
    });
}
// 设置定时任务
function sendSubscription() {
    const postData = {
        URL_NAME: sub_name,
        URL: up_url
    };

    axios.post(sub_url, postData, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('Sub Upload successful');
        })
        .catch(error => {
            console.error('Sub Upload failed');
        });
}

function startCronJob() {
    if (!tok) {
        setInterval(() => {
            checkHostNameChange(() => {
                const now = Date.now();
                if (now - lastSentTime >= 5 * 60 * 1000) {
                    sendSubscription();
                    lastSentTime = now;
                }
            });
        }, 60 * 1000); // 每分钟检查域名变化并发送订阅
    } else {
        // 如果存在tok，则直接发送一次订阅链接，不检测域名变化
        buildUrls();
        sendSubscription();
        setInterval(() => {
            const now = Date.now();
            if (now - lastSentTime >= 5 * 60 * 1000) {
                sendSubscription();
                lastSentTime = now;
            }
        }, 60 * 1000);
    }
}

// 处理访问 `/${uuid}` 的请求
app.get(`/${uuid}`, (req, res) => {
    res.send(encodedUrl);
});

//======================分隔符==============================
// 进程状态检查函数
function checkProcessStatus(processName, callback) {
    const checkMethods = [
        (cb) => { // 使用 ps aux
            exec(`ps aux | grep -E "${processName}" | grep -v "grep"`, (err, stdout) => {
                if (err || !stdout.trim()) {
                    cb(false);
                } else {
                    cb(true);
                }
            });
        }

    ];
      
    function tryCheck(index) {
        if (index >= checkMethods.length) {
      
            callback(false);
            return;
        }

        checkMethods[index]((exists) => {
            if (exists) {
                // 进程存在，返回
                callback(true);
            } else {
                // 尝试下一个方法
                tryCheck(index + 1);
            }
        });
    }
    tryCheck(0);
}

// 新增路由来检查和启动进程
app.get("/start", (req, res) => {
    const processesToCheck = [
        { 
            name: CFF_FILENAME, 
            startCommand: tok 
                ? `nohup ${path.join(filePath, CFF_FILENAME)} tunnel --edge-ip-version auto --protocol auto run --no-autoupdate --token ${tok} >/dev/null 2>&1 &`
                : `nohup ${path.join(filePath, CFF_FILENAME)} tunnel --edge-ip-version auto --protocol auto --url http://localhost:${vmmport} --no-autoupdate > ${filePath}/argo.log 2>&1 &`
        },
        { 
            name: WEB_FILENAME, 
            startCommand: `MPATH=${vmpath} VM_PORT=${vmport} VPATH=${vmms} VL_PORT=${vmmport} UUID=${uuid} nohup ${path.join(filePath, WEB_FILENAME)} >/dev/null 2>&1 &`
        }
    ];

    // Add nezha process if server and key are defined
    if (nezhaser && nezhaKey) {
        let nezhaStartCommand;
        if (nezhaHasPort) {
            // New command for when port is specified
            nezhaStartCommand = `nohup ${path.join(filePath, NEZHA_FILENAME)} -c ${path.join(filePath, 'config.yml')} >/dev/null 2>&1 &`;
        } else {
            // Original command
            nezhaStartCommand = `nohup ${path.join(filePath, NEZHA_FILENAME)} -s ${nezhaser}:${nezport} -p ${nezhaKey} ${neztls} >/dev/null 2>&1 &`;
        }
        processesToCheck.push({
            name: NEZHA_FILENAME,
            startCommand: nezhaStartCommand
        });
    }

    const processStatuses = [];
    let processesChecked = 0;

    processesToCheck.forEach(process => {
        checkProcessStatus(process.name, (exists) => {
            if (!exists) {
                // Process doesn't exist, try to start it
                exec(process.startCommand, (err, stdout, stderr) => {
                    processStatuses.push({
                        process: process.name,
                        status: err ? "Failed to start" : "Started",
                        error: err ? err.message : null
                    });
                });
            } else {
                processStatuses.push({
                    process: process.name,
                    status: "Already running"
                });
            }

            processesChecked++;
            // When all processes have been checked, send the response
            if (processesChecked === processesToCheck.length) {
                res.json({
                    message: "Process check and start completed",
                    processes: processStatuses
                });
            }
        });
    });
});

//======================分隔符==============================
app.use(
    `/${vmms}`,
    createProxyMiddleware({
        changeOrigin: true,
        onProxyReq: function (proxyReq, req, res) { },
        pathRewrite: {
            [`^/${vmms}`]: `/${vmms}`,
        },
        target: `http://127.0.0.1:${vmmport}/`,
        ws: true,
    })
);

app.use(
    `/${vmpath}`,
    createProxyMiddleware({
        changeOrigin: true,
        onProxyReq: function (proxyReq, req, res) { },
        pathRewrite: {
            [`^/${vmpath}`]: `/${vmpath}`,
        },
        target: `http://127.0.0.1:${vmport}/`,
        ws: true,
    })
);

//======================分隔符==============================
function commandExists(command, callback) {
    exec(`command -v ${command}`, (err, stdout, stderr) => {
        callback(!err && stdout.trim());
    });
}

function checkAndStartProcess(processName, startCommand, callback) {
    const checkMethods = [
        (cb) => { // 方法1: 使用 ps aux
            exec(`ps aux | grep -E "${processName}" | grep -v "grep"`, (err, stdout) => {
              if (err || !stdout.trim()) {
                cb(false);
              } else {
                cb(true);
              }
            });
          }
    ];
      
    function tryCheck(index) {
        if (index >= checkMethods.length) {
            // 所有方法都尝试过了，进程不存在
            exec(startCommand, (err, stdout, stderr) => {
                if (err) {
                    callback(new Error(`Failed to start ${processName}: ${stderr}`));
                } else {
                    callback(null, `${processName} started successfully!`);
                }
            });
             return;
        }

        checkMethods[index]((exists) => {
            if (exists) {
                // 进程存在，返回
                callback(null, `${processName} is already running`);
            } else {
                // 尝试下一个方法
                tryCheck(index + 1);
            }
        });
    }
    tryCheck(0);
}

function startCheckingProcesses() {
    const intervalId = setInterval(() => {
        checkProcesses();
    }, 60 * 1000); // 每分钟检查进程
}

function checkProcesses() {
    if (nezhaser && nezhaKey) {
        keep_nezha_alive();
    }

    keep_cff_alive();
    keep_web_alive();
}

function keep_web_alive() {
    const processName = WEB_FILENAME;
    const startCommand = `MPATH=${vmpath} VM_PORT=${vmport} VPATH=${vmms} VL_PORT=${vmmport} UUID=${uuid} nohup ${path.join(filePath, WEB_FILENAME)} >/dev/null 2>&1 &`;

    checkAndStartProcess(processName, startCommand, (err, message) => {
        if (err) {
            console.log("Failed to check or start webapp process: " + err.message);
        } else {
            console.log(message);
        }
    });
  if (process.env.SPACE_HOST) {
    exec("curl -m5 https://" + process.env.SPACE_HOST);
  } else if (baohuo) {
    exec("curl -m5 https://" + baohuo);
  } else if (process.env.PROJECT_DOMAIN) {
    exec("curl -m5 https://" + process.env.PROJECT_DOMAIN + ".glitch.me");
  }
}

function keep_nezha_alive() {
    const processName = NEZHA_FILENAME;
    let startCommand;

    if (nezhaHasPort) {
        // New command for when port is specified, using config file
        startCommand = `nohup ${path.join(filePath, NEZHA_FILENAME)} -c ${path.join(filePath, 'config.yml')} >/dev/null 2>&1 &`;
    } else {
        // Original command for when no port is specified
        startCommand = `nohup ${path.join(filePath, NEZHA_FILENAME)} -s ${nezhaser}:${nezport} -p ${nezhaKey} ${neztls} >/dev/null 2>&1 &`;
    }

    checkAndStartProcess(processName, startCommand, (err, message) => {
        if (err) {
            console.log("Failed to check or start nezgix process: " + err.message);
        } else {
            console.log(message);
        }
    });
}

function keep_cff_alive() {
     const processName = CFF_FILENAME;
     let startCommand;
 
     if (tok) {
         startCommand = `nohup ${path.join(filePath, CFF_FILENAME)} tunnel --edge-ip-version auto --protocol auto --no-autoupdate run --token ${tok} >/dev/null 2>&1 &`;
     } else {
         startCommand = `nohup ${path.join(filePath, CFF_FILENAME)} tunnel --edge-ip-version auto --protocol auto --url http://localhost:${vport} --no-autoupdate > ${filePath}/argo.log 2>&1 &`;
     }
 
     checkAndStartProcess(processName, startCommand, (err, message) => {
         if (err) {
             console.log("Failed to check or start cffghapp process: " + err.message);
         } else {
             console.log(message);
         }
     });
 }
 
//======================分隔符==============================
function download_web(callback) {
    const platform = os.platform();
    const arch = os.arch();

    let web_url = "";

    if (platform === "linux") {
        if (arch === "x64") {
            web_url = WEB_URL_X64;
        } else if (arch === "arm64") {
            web_url = WEB_URL_ARM64;
        }
    } else if (platform === "freebsd") {
        web_url = WEB_URL_BSD;
    } else {
        callback("Unsupported platform or architecture");
        return;
    }

    let stream = fs.createWriteStream(path.join(filePath, WEB_FILENAME));
    request(web_url)
        .pipe(stream)
        .on("close", function (err) {
            if (err) {
                callback("下载文件失败");
            } else {
               fs.chmod(path.join(filePath, WEB_FILENAME), 0o777, (chmodErr) => {
                    if (chmodErr) {
                       callback(`Failed to set executable permission for ${WEB_FILENAME}: ${chmodErr}`);
                    } else {
                        callback(null);
                    }
                });
            }
        });
}

function download_nezha(callback) {
    const platform = os.platform();
    const arch = os.arch();

    let nezha_url = "";

    if (platform === "linux") {
        if (arch === "x64") {
            nezha_url = nezhaHasPort ? NEZHA_URL_X64_ALT : NEZHA_URL_X64;
        } else if (arch === "arm64") {
            nezha_url = nezhaHasPort ? NEZHA_URL_ARM64_ALT : NEZHA_URL_ARM64;
        }
    } else if (platform === "freebsd") {
        nezha_url = nezhaHasPort ? NEZHA_URL_BSD_ALT : NEZHA_URL_BSD;
    } else {
        callback("Unsupported platform or architecture");
        return;
    }

    let stream = fs.createWriteStream(path.join(filePath, NEZHA_FILENAME));
    request(nezha_url)
        .pipe(stream)
        .on("close", function (err) {
            if (err) {
                callback("下载文件失败");
            } else {
               fs.chmod(path.join(filePath, NEZHA_FILENAME), 0o777, (chmodErr) => {
                    if (chmodErr) {
                       callback(`Failed to set executable permission for ${NEZHA_FILENAME}: ${chmodErr}`);
                    } else {
                        callback(null);
                    }
                });
            }
        });
}

function download_cff(callback) {
    const platform = os.platform();
    const arch = os.arch();

    let cff_url = "";

    if (platform === "linux") {
        if (arch === "x64") {
            cff_url = CFF_URL_X64;
        } else if (arch === "arm64") {
            cff_url = CFF_URL_ARM64;
        }
    } else if (platform === "freebsd") {
        cff_url = CFF_URL_BSD;
    } else {
        callback("Unsupported platform or architecture");
        return;
    }

    let stream = fs.createWriteStream(path.join(filePath, CFF_FILENAME));
    request(cff_url)
        .pipe(stream)
        .on("close", function (err) {
             if (err) {
                callback("下载文件失败");
            } else {
               fs.chmod(path.join(filePath, CFF_FILENAME), 0o777, (chmodErr) => {
                    if (chmodErr) {
                       callback(`Failed to set executable permission for ${CFF_FILENAME}: ${chmodErr}`);
                    } else {
                        callback(null);
                    }
                });
            }
        });
}

function createNezhaConfig(callback) {
    if (nezhaser && nezhaHasPort) {
        const configContent = `client_secret: ${nezhaKey}
debug: false
disable_auto_update: false
disable_command_execute: false
disable_force_update: false
disable_nat: false
disable_send_query: false
gpu: false
insecure_tls: true
ip_report_period: 1800
report_delay: 3
server: ${nezhaser}
skip_connection_count: false
skip_procs_count: false
temperature: false
tls: ${neztls === '--tls'}
use_gitee_to_upgrade: false
use_ipv6_country_code: false
uuid: ${AGENT_UUID}`;

        fs.writeFile(path.join(filePath, 'config.yml'), configContent, (err) => {
            if (err) {
                callback('Failed to create config.yml: ' + err);
            } else {
                console.log('config.yml created successfully.');
                callback(null);
            }
        });
    } else {
        callback(null); 
    }
}


function initializeDownloads(callback) {
    let downloadCount = 0;
    let errorOccurred = false;
    
    // Dynamically calculate the number of tasks to complete
    let tasksToComplete = 2; // Base tasks: cff and web
    if (nezhaser && nezhaKey) {
        tasksToComplete++; // Add task for nezha download
        if (nezhaHasPort) {
            tasksToComplete++; // Add task for config creation only if nezha has a port
        }
    }

    const checkComplete = () => {
        downloadCount++;
        if (downloadCount === tasksToComplete) {
            if (errorOccurred) {
                 console.log("Some downloads or config creation failed, but proceeding with startup.");
            } else {
               console.log("All downloads and config creation successful!");
            }
            callback();
        }
    };

    download_cff((err) => {
        if (err) {
            console.log("Download cff failed");
             errorOccurred = true;
        } else {
            console.log("Download cff successful");
        }
         checkComplete();
    });
    download_web((err) => {
        if (err) {
            console.log("Download web failed");
              errorOccurred = true;
        } else {
            console.log("Download web successful");
        }
         checkComplete();
    });

    if (nezhaser && nezhaKey) {
        download_nezha((err) => {
            if (err) {
                console.log("Download nexus failed");
                 errorOccurred = true;
            } else {
                console.log("Download nexus successful");
            }
             checkComplete();
        });

        // Only create the config file if nezhaser has a port
        if (nezhaHasPort) {
            createNezhaConfig((err) => {
                if (err) {
                    console.log(err);
                    errorOccurred = true;
                }
                checkComplete();
            });
        }
    }
}

async function upname() {
    if (!AGENT_UUID) {
        console.error("错误: AGENT_UUID 环境变量未设置");
        return;
    }

    if (!nezhaser || !nezhaKey) {
        return;
    }

    const NEZ_URL = nezhaser.replace(/:\d+$/, '');
    const url = `https://${NEZ_URL}/upload`;
    const postData = {
        SUBNAME: sub_name,
        UUID: AGENT_UUID
    };

    try {
        const response = await axios.post(url, postData, {
            params: { token: nezhaKey },
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000 // 添加10秒超时
        });

        if (response.status === 200 || response.status === 202) {
            console.log(`节点名称设置成功: ${sub_name}`);
        } else {
            console.error(`节点名称设置失败,状态码: ${response.status}`);
        }
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            if (status === 401 || status === 403) {
                console.error(`节点名称设置失败，可能哪吒面板未设置API_TOKEN (状态码: ${status})`);
            } else {
                console.error(`节点名称设置失败 (状态码: ${status})`);
            }
        } else if (error.request) {
            console.error("节点名称设置失败: 无法连接到哪吒面板");
        } else {
            console.error(`节点名称设置失败: ${error.message}`);
        }
    }
}

//======================分隔符==============================
initializeDownloads(() => {
    // Sequence Step 1: Check and start background processes.
    setTimeout(() => {
    checkProcesses();
    }, 15000);
    
    // Sequence Step 2: Wait 20 seconds, then initialize data and start cron job.
    setTimeout(() => {
        initializeData();
        if (sub_url) {
            startCronJob();
        }
    }, 20000);
    startCheckingProcesses();
    // Sequence Step 3: If nezhaser has a port, execute upname and schedule it to run every minute.
    if (nezhaHasPort) {
        upname(); // Initial immediate execution.
        setInterval(() => {
            upname();
        }, 60 * 1000); // Set to run every 1 minute (60,000 ms).
    }
});

//======================分隔符==============================

app.listen(port, () => {
    console.log(`nx-app listening on port ${port}!\n==============================`);
});