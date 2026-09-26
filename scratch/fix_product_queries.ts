
import fs from 'fs';
import path from 'path';

const filePath = path.join('d:', 'Work', 'furniture_store', 'src', 'actions', 'product.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Helper to add showPrice to select blocks
function addShowPrice(fnName: string) {
  const fnRegex = new RegExp(`(export async function ${fnName}\\(.*?\\).*?\\{.*?variants:\\s*\\{.*?select:\\s*\\{)([\\s\\S]*?)(sizeNameEn: true,?\\s*)(\\},)`, 'g');
  
  // We need to be careful with greedy matching. Let's find the specific block.
  // Instead of one big regex, let's find the function first.
  const startIdx = content.indexOf(`function ${fnName}`);
  if (startIdx === -1) {
    console.log(`Function ${fnName} not found`);
    return;
  }
  
  // Find where variants select block starts after function name
  const variantsIdx = content.indexOf('variants:', startIdx);
  const selectIdx = content.indexOf('select:', variantsIdx);
  const sizeNameEnIdx = content.indexOf('sizeNameEn: true', selectIdx);
  const endBracketIdx = content.indexOf('}', sizeNameEnIdx);
  
  if (variantsIdx !== -1 && selectIdx !== -1 && sizeNameEnIdx !== -1 && endBracketIdx !== -1) {
    // Check if showPrice is already there
    const slice = content.slice(selectIdx, endBracketIdx);
    if (!slice.includes('showPrice: true')) {
       const insertPos = sizeNameEnIdx + 'sizeNameEn: true,'.length;
       const indentation = "\n            "; // Based on usual 12 spaces in view_file
       content = content.slice(0, insertPos) + indentation + "showPrice: true," + content.slice(insertPos);
       console.log(`Added showPrice to ${fnName}`);
    } else {
       console.log(`showPrice already exists in ${fnName}`);
    }
  }
}

addShowPrice('getFeaturedProducts');
addShowPrice('getNewArrivals');
addShowPrice('getBestSellers');

fs.writeFileSync(filePath, content);
console.log('Finished updating product.ts');
