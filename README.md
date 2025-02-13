🖥️ Core Daemon

## **Decentralized Data Storage for the Internxt Network**

**Core Daemon** is a **standalone CLI daemon** that enables users to operate storage nodes within the Internxt decentralized network. It allows node operators to **store shards** (encrypted file fragments) on their local machines, contributing to the distributed storage system.

### 🚨 **Important Notice**
This repository is no longer actively developed by Internxt. However, the core functionality remains relevant for understanding decentralized storage mechanisms.

---

## 📌 **Project Scope and Required Implementation**

### **🔹 Existing Functionality**
- **Storage of file shards in a key-value database** using **LevelDB/KFS**.
- **Indexing**: Each shard is indexed by its **hash** as the key, and the **binary content** is stored as the value.
- **Decentralized operation**: Each storage node receives shards from the network, storing and retrieving them upon request.

### **🛠️ New Feature to Implement**
The goal is to **extend the storage system** by adding an alternative method for saving shards: **as conventional files on disk**.

- **Instead of only storing shards in LevelDB/KFS, they should also be stored as separate files in the filesystem**.
- **Each shard will be saved in a dedicated directory (`/shards/`), with its filename being the hash of the shard**.

### **🔹 Expected Behavior**
1. When a shard is **stored**:
   - It must be saved **both** in LevelDB/KFS and as a **file on disk**.
   - The filename should be the **hash** of the shard.
   - The **content of the file** should be the **binary data** of the shard.

2. When a shard is **retrieved**:
   - The system should first **attempt to retrieve the shard from LevelDB/KFS**.
   - If the shard is **not found in LevelDB/KFS**, it should **check for a corresponding file in the `/shards/` directory**.
   - If the shard exists as a file, its **binary content should be returned**.

### **📁 Expected File Structure**
/shards/ ├── aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa # File name = hash ├── bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb # Content = binary data ├── cccccccccccccccccccccccccccccccccccccccc

markdown
Copy
Edit

---

## 🚀 **Installation Guide**

### **🔧 Prerequisites**
- **Node.js v10.x.x** (NVM recommended for version management)
- **Yarn** (dependency manager)
- **Python and C++ build tools** (for compiling dependencies)

### **🏗️ Installation Steps**

#### 🔹 **MacOS (via Homebrew)**

brew install git python
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 10
npm i -g yarn
export STORJ_NETWORK=INXT
yarn --ignore-engines
🔹 Linux

sudo apt update
sudo apt install git python build-essential
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 10
npm i -g yarn
export STORJ_NETWORK=INXT
yarn --ignore-engines
🏗 Implementation Steps for the New Feature
To add file-based shard storage while maintaining compatibility with the existing LevelDB/KFS-based system, follow these steps:

1️⃣ Modify the Storage Layer
Implement a dual storage mechanism:
Primary storage: LevelDB/KFS.
Secondary storage: Filesystem-based shards.

2️⃣ Implement Read & Write Operations
On storing a shard:

Save it in LevelDB/KFS as before.
Create a new file under /shards/ with:
Filename = Hash of the shard
File content = Binary shard data
On retrieving a shard:

First, attempt to retrieve from LevelDB/KFS.
If the shard does not exist in LevelDB/KFS, check the /shards/ directory.
If found, load the file and return its binary content.

3️⃣ Ensure Coexistence with LevelDB/KFS
DO NOT replace the existing storage method.
The system should check both storage options and seamlessly retrieve the requested shard.

✅ Testing
After implementing the new feature, run the test suite to verify its correctness.

yarn run test
🛠️ Additional Tests
You should also write new tests to verify:

Shards are correctly stored as files.
Shards can be retrieved from both LevelDB/KFS and the filesystem.
The implementation does not interfere with existing storage behavior.
🔍 Debugging & Logs
To monitor and debug the daemon:

xcore killall
xcore daemon --foreground
Check logs in:


$HOME/.xcore/logs/daemon.log
🔌 Usage: Running Core Daemon
Starting the daemon

xcore daemon
Creating a New Node
To configure a new node, use:


xcore create --inxt 0x0000000000000000000000000000000000000000 --storage /home/user/xcore --size 10TB --rpcport 12345 --rpcaddress 81.81.81.81 --noedit
This generates a node configuration file at:

/home/user/.xcore/configs/[your-node-id].json
Starting a Node

export STORJ_NETWORK=INXT
xcore daemon
xcore start --config /home/user/.xcore/configs/your-node-id.json
📡 Connecting to a Remote Daemon
To connect to a remote daemon instance:


xcore status --remote 192.168.0.10
If the daemon runs on a custom port:


xcore status --remote 192.168.0.10:51000
⚙ Daemon Configuration
The daemon loads configuration from $HOME/.xcore/config.
Modify this file to set custom options:


{
  "daemonRpcPort": 45015,
  "daemonRpcAddress": "127.0.0.1",
  "daemonLogFilePath": "",
  "daemonLogVerbosity": 3
}
🔒 Security Considerations
Do NOT expose xcore-daemon to the internet, as it could reveal sensitive data.
Ensure your node is properly firewalled and only accessible to trusted devices.

📝 Final Notes
✔ The new file storage system must be an addition, not a replacement.
✔ Ensure compatibility with existing LevelDB/KFS-based storage.
✔ Write tests to validate functionality and prevent regressions.
