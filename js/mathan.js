var facts = [];
function fact(n){
    var f=1;
    for (var i=2;i<=n;i++){
        f*=i;
    }
    return f;
}
function permutation(index, A){
    var n=A.length;
    var i=index+1;
    var res=[];
    for(var t=1;t<=n;t++){
        var f = fact(n-t);
        var k=Math.floor((i+f-1)/f);
        res.push(A.splice(k-1,1)[0]);
        i-=(k-1)*f;
    }
    if (A.length) res.push(A[0]);
    return res;
}

function log(){
    var msg = Array.prototype.slice.call(arguments).join(" ");
    document.getElementById("log").value+="\n"+msg;
    console.log(arguments);
}
const M = ["A","B","C","D"];
var fml=fact(M.length);
console.log(M);
//console.log(M, permutation(3, ["A","B","C","D"]));
//console.log(M, permutation(2, ["A","B","C","D"]));
//console.log(M, permutation(5,["A","B","C","D"]));
//for (var i=1;i<10;i++) {console.log(i, fact(i))}
for(var i=0;i<fml;i++){
    //console.log(i,permutation(i,M.slice(0)).join(""));
    console.log(i, permutation(i, M.slice(0)));
}