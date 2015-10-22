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
function reduceArray(A,i){
    var bitMask= i.toString(2);
    var l=bitMask.length;
    for (i=l-1;i>=0;i--){
        if (bitMask[i]==="1"){
            A.splice(i+2,1);
        }
    }
    return A;
}

function fullHouse(A){
    var fh=[];
    var fal=fact(A.length);
    for(var i=0;i<fal;i++){
        var Aext=permutation(i, A.slice(0));
        fh.push(Aext);
        //var nrp= (2<< Aext.length)-1;
        //for (var i=0;i<=nrp;i++){
        //    fh.push(reduceArray(Aext.slice(0),i));
        //}
    }
    return fh;
}

function log(){
    var msg = Array.prototype.slice.call(arguments).join(" ");
    document.getElementById("log").value+="\n"+msg;
    console.log(arguments);
}
var M = ["A","B","C","D"];

console.log(M);


//console.log(M, permutation(3, ["A","B","C","D"]));
//reducedPermutation(M.slice(0));
//reduceArray(M,4);console.log(M);

