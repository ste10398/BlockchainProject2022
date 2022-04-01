const console = require("console")
const fs = require("fs")
//ipfs connection
const IPFS = require('ipfs-mini')

function makeJsonUrl(ipfs, json, f, id, id_f) {
  return new Promise(function (resolve, reject){
    ipfs.add(json,  (err, hash) => {
      if(err){
        return reject(console.log(err))
      }
      url = t+hash
      //write url in file
      if(typeof id_f == "undefined") {
        f.write(id + "," + url + "\n")
      } 
      else {
        f.write(id+","+url+","+id_f+"\n")
      }
      
      resolve("CREATED")
    })
  })
}

async function main() {
  
  csv_watches = fs.readFileSync("watches_data.csv")
  csv_components = fs.readFileSync("components_data.csv")

  
  //const { url } = require("inspector")
  const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

  var array_w = csv_watches.toString().replaceAll('\r', '').split("\n")
  var array_c = csv_components.toString().replaceAll('\r', '').split("\n")
  
  // The array[0] contains all the header columns so we store them in headers array
  let headers_w = array_w[0].split(";")
  let headers_c = array_c[0].split(";")

  t = "https://ipfs.infura.io/ipfs/"


  //WATCHES FILE CREATION
  var file = fs.createWriteStream('urlWatches.txt')
  file.on('error', function(err) { console.log(err) })

  // Since headers are separated, we need to traverse remaining n-1 rows.
  for (let i = 1; i < array_w.length - 1; i++) {
    let obj = {}
  
    // Create an empty object to later add values of the current row to it
    // Declare string str as current array value to change the delimiter and store the generated string in a new string s
    let str = array_w[i]
    let s = ''
  
    // By Default, we get the comma separated values of a cell in quotes " " so we use flag to keep track of quotes and
    // split the string accordingly. If we encounter opening quote (") then we keep commas as it is otherwise
    // we replace them with pipe | We keep adding the characters we traverse to a String s
    let flag = 0

    for (let ch of str) {
      if (ch === '"' && flag === 0) {
        flag = 1
      }
      else if (ch === '"' && flag == 1) flag = 0
      if (ch === ';' && flag === 0) ch = '|'
      if (ch !== '"') s += ch
    }
  
    // Split the string using pipe delimiter | and store the values in a properties array
    let properties = s.split("|")
  
    // For each header, if the value contains multiple comma separated data, then we store it in the form of array otherwise
    // directly the value is stored
    var id = 0
    for (let j in headers_w) {
      if(headers_w[j] == 'ID'){ 
        id = properties[j]
      }
      obj[headers_w[j]] = properties[j]
    }
  
    // Convert the resultant array to json and generate the JSON output file.
    let json = JSON.stringify(obj)
    
    await  makeJsonUrl(ipfs, json, file, id)
  }

  file.end()

  //COMPONENTS FILE CREATION
  var file2 = fs.createWriteStream('urlComponents.txt')
  file2.on('error', function(err) { console.log(err) })

  for (let i = 1; i < array_c.length - 1; i++) {
    let obj = {}
  
    let str = array_c[i]
    let s = ''
  
    let flag = 0

    for (let ch of str) {
      if (ch === '"' && flag === 0) {
        flag = 1
      }
      else if (ch === '"' && flag == 1) flag = 0
      if (ch === ';' && flag === 0) ch = '|'
      if (ch !== '"') s += ch
    }
  
    let properties = s.split("|")
  
    var id = 0
    var id_f = 0
    for (let j in headers_c) {
      if(headers_c[j] == 'Father_ID'){ 
        id_f = properties[j]
        continue;
      }
      if(headers_c[j] == 'ID'){ 
        id = properties[j]
      }
      obj[headers_c[j]] = properties[j]
    }

    let json = JSON.stringify(obj)
    
    await  makeJsonUrl(ipfs, json, file2, id, id_f)
  }

  file2.end()
}

 main()