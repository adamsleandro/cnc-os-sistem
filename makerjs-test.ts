import makerjs from 'makerjs';
const dxfString = `0
SECTION
2
ENTITIES
0
LINE
8
0
10
0.0
20
0.0
30
0.0
11
100.0
21
100.0
31
0.0
0
ENDSEC
0
EOF`;

const parseList = makerjs.importer.parseNumericList; 
console.log(Object.keys(makerjs.importer));
