
import fs from 'fs';
import path from 'path';

const filePath = path.join('d:', 'Work', 'furniture_store', 'src', 'actions', 'product.ts');
let content = fs.readFileSync(filePath, 'utf8');

const functions = [
  'getProducts',
  'getProductsByIds',
  'getFeaturedProducts',
  'getNewArrivals',
  'getBestSellers',
  'getSpecialOffers'
];

functions.forEach(fnName => {
  const startIdx = content.indexOf(`function ${fnName}`);
  if (startIdx === -1) return;
  
  const variantsIdx = content.indexOf('variants:', startIdx);
  const selectIdx = content.indexOf('select:', variantsIdx);
  const endBracketIdx = content.indexOf('}', selectIdx);
  
  if (variantsIdx !== -1 && selectIdx !== -1 && endBracketIdx !== -1) {
    const slice = content.slice(selectIdx, endBracketIdx);
    
    // Add showPrice if missing
    if (!slice.includes('showPrice: true')) {
       // Insert before last }
       const insertPos = endBracketIdx - 1;
       content = content.slice(0, insertPos) + "  showPrice: true,\n            " + content.slice(insertPos);
    }
    
    // Add stock if missing
    if (!slice.includes('stock: true')) {
       // Refresh indices as content changed
       const newVariantsIdx = content.indexOf('variants:', startIdx);
       const newSelectIdx = content.indexOf('select:', newVariantsIdx);
       const newEndBracketIdx = content.indexOf('}', newSelectIdx);
       const insertPos = newEndBracketIdx - 1;
       content = content.slice(0, insertPos) + "  stock: true,\n            " + content.slice(insertPos);
    }
  }
});

fs.writeFileSync(filePath, content);
console.log('Updated product.ts with showPrice and stock fields');
