function fact(n){
    var f=1;
    for (var i=2;i<=n;i++){f*=i;}
    return f;
}
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
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
    var al=A.length;
    for (i=l-1;i>=0;i--){
        if (bitMask[i]==="1"){A.splice(i+(al-l),1);
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
        //console.log(i,Aext);
        var nrp= (2<< (Aext.length-1))-2;
        for (var j=1;j<=nrp;j++){
            //console.log(j.toString(2),Aext, reduceArray(Aext.slice(0),j));
            var toExt=reduceArray(Aext.slice(0),j);
            if (toExt.length===0) break;
            var unique=true;
            for (var u=0; u<fh.length; u++)
                if (toExt.equals(fh[u])) {unique=false; break};
            if (unique) {fh.push(toExt)};
        }
    }
    return fh;
}

//console.log(fullHouse(["a","b","c"]));
//console.log(M, permutation(3, ["A","B","C","D"]));
//reducedPermutation(M.slice(0));
//reduceArray(M,4);console.log(M);

