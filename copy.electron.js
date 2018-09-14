const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const excluded = [ ".git", ".gitignore", "README.md", "LICENSE", "copy.electron.js", "package-lock.json" ];
const program = require("commander");

program
 .option("--skip-node-modules", "Skip node_modules")
 .option("--link", "Link instead of copying")
 .parse(process.argv);

if (program.skipNodeModules) {
   excluded.push("node_modules")
}

const linking = !!program.link;
const desktop_dir = path.dirname(__dirname) + "/masterwallet-desktop";

console.log("destination: ", desktop_dir);

fs.readdir(".", (err, items) => {
  for (let i = 0; i < items.length; i++) {
     const file = items[i];
     if (excluded.indexOf(file) !== -1) continue;
     const allowLink = file.indexOf(".json") === -1;
    
     console.log((linking && allowLink ? "linking " : "copying ") + file);
     shell.exec((linking && allowLink) ? 
         "ln -s " + __dirname + "/" + file + " " + desktop_dir + "/" +  file
       : "cp -rf " + __dirname + "/" + file + " " + desktop_dir + "/");
  }
  if (!linking) {
    console.log("removing tests");
    shell.exec("rm -f " + desktop_dir + "/network/*/*.test.js");
    shell.exec("rm -f " + desktop_dir + "/ipc/*.test.js");
    shell.exec("rm -f " + desktop_dir + "/api/*.test.js");
  }

  console.log("updating package.json");
  const fnJson = desktop_dir + "/package.json";
  const json = JSON.parse(fs.readFileSync(fnJson));

  json.name = "masterwallet-desktop";
  json.description = "MasterWallet Pro - Desktop Wallet for CryptoAsset Management";
  json.main = "main.js";
  json.scripts = { 
     "app": "cross-env DEBUG=* electron main.js" 
  };

  fs.writeFileSync(fnJson, JSON.stringify(json, null, 2));
});



