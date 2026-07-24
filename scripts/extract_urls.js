const fs = require('fs');

const files = [
  ['剑来 (4906880)', 'D:/SW_Temp/TEMP/Temp/trae/toolcall-output/35e3df25-fdff-4573-8a99-5b952dadad8b.txt'],
  ['钟馗传 (4550140)', 'D:/SW_Temp/TEMP/Temp/trae/toolcall-output/56d85600-38d1-4607-b195-6488ae62f296.txt'],
  ['抵抗者 (3184960)', 'D:/SW_Temp/TEMP/Temp/trae/toolcall-output/83d97d69-40f7-4ee7-b971-2a71f8f3c44b.txt'],
  ['古剑(新) (4729320)', 'D:/SW_Temp/TEMP/Temp/trae/toolcall-output/39322351-1c51-4a47-99c0-10717af7caaa.txt'],
];

for (const [name, file] of files) {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const match = content.match(/"header_image":"([^"]+)"/);
    if (match) {
      // Unescape JSON string
      const url = match[1].replace(/\\\//g, '/');
      console.log(name + ' | ' + url);
    } else {
      console.log(name + ' | NO header_image found');
    }
  } catch (e) {
    console.log(name + ' | ERROR: ' + e.message);
  }
}

// Also print the known ones from earlier WebFetch results
console.log('\n=== Previously found ===');
console.log('锦衣卫 (4295810) | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4295810/df5eb611429079feae125f34e9be3eed6ff38692/header.jpg?t=1781604804');
console.log('穿越火线：潜伏 (4687500) | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4687500/34be6a0dca64984114ef8094a8cb33c9e5fea53f/header.jpg?t=1781722040');
console.log('水浒：道反天罡 (4572160) | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4572160/3563f371720db73fb59c78c5e5373dfc8ff089c6/header.jpg?t=1784704735');
