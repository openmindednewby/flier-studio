(()=>{const P=CanvasRenderingContext2D.prototype,ft=P.fillText,di=P.drawImage;
const L=c=>c.__log||(c.__log=[]);
P.fillText=function(s,x,y,...r){L(this.canvas).push({t:'text',s:String(s),x,y,font:this.font,align:this.textAlign,w:this.measureText(String(s)).width,asc:this.measureText(String(s)).actualBoundingBoxAscent,desc:this.measureText(String(s)).actualBoundingBoxDescent,bl:this.measureText(String(s)).actualBoundingBoxLeft,br:this.measureText(String(s)).actualBoundingBoxRight,lw:this.lineWidth});return ft.call(this,s,x,y,...r)};
P.drawImage=function(img,...a){const q=a.length>=8?a.slice(4):a;L(this.canvas).push({t:'img',iw:img.width,ih:img.height,x:q[0],y:q[1],w:q[2],h:q[3]});return di.call(this,img,...a)};})();
