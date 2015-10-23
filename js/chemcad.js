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

function Stream(v,c){
    this.v=v||null;
    this.c=c||null;
    this.selfCheck=false;
    this.Show=function(){//how to add default values?
        return "volume="+this.v+",conc="+this.c+",selfCheck:"+this.selfCheck+"; ";
    }
}
function Source(v,c){
    this.out1=new Stream(v,c);
    this.calc=function(){};
}
function Sink(){
    this.in1=null;
    this.calc=function(){};
}
function Mixer(fixedV){
    this.fv=fixedV;
    this.in1=null;
    this.in2=null;
    this.out1=new Stream();
    this.calc=function(){
        this.out1.v=this.fv;//||this.in1.v+this.in2.v;
        this.in2.v=this.in2.v||0;
        this.in2.c=this.in2.c||0;
        this.in1.v=this.out1.v-this.in2.v;
        this.out1.c =(this.in1.v*this.in1.c+this.in2.v*this.in2.c)/this.out1.v;
        this.out1.selfCheck=Math.abs
            ((this.in1.v*this.in1.c+this.in2.v*this.in2.c)-(this.out1.v*this.out1.c))<eps;
    }
}
function Splitter(kS){
    this.in1=null;
    this.ks=kS||0.05;
    this.out1=new Stream();
    this.out2=new Stream();
    this.calc=function(){
        this.out1.v=this.in1.v*(1-this.ks);
        this.out2.v=this.in1.v*(this.ks);
        this.out1.c=this.in1.c;
        this.out2.c=this.in1.c;
    }

}
function Mem(kV,kC) {
    this.kv = kV;//||0.15;
    this.kc = kC;//||0.95;
    this.in1 = null;
    this.out1 = new Stream();
    this.out2 = new Stream();
    this.calc = function () {
        this.out1.v = this.in1.v * this.kv;
        this.out1.c = this.in1.c * (1 - this.kc);
        this.out2.v = this.in1.v * (1 - this.kv);
        this.out2.c = (this.in1.v * this.in1.c - this.out1.v * this.out1.c) / this.out2.v;
        this.out1.selfCheck = this.out2.selfCheck = Math.abs
            (this.in1.v * this.in1.c - (this.out1.v * this.out1.c + this.out2.v * this.out2.c)) < eps;
    }
}
function MemV(kV,kC,maxV,maxC) {//modified Mem where out1 depends on V
    this.kv = kV;//||0.15;
    this.kc = kC;//||0.95;
    this.maxV=maxV||940;
    this.maxC=maxC||0.87;
    this.rnd=Math.random()
    this.in1 = null;
    this.out1 = new Stream();
    this.out2 = new Stream();
    this.calc = function () {
        this.out1.v = this.in1.v * this.kv*this.rnd;
        this.out1.c = this.in1.c * (1 - this.kc)*(100*this.rnd/this.in1.v);
        this.out2.v = this.in1.v * (1 - this.kv)*100/(1200-this.in1.v);
        this.out2.c = (this.in1.v * this.in1.c - this.out1.v * this.out1.c) / this.out2.v;
        this.out1.selfCheck = this.out2.selfCheck = Math.abs
            (this.in1.v * this.in1.c - (this.out1.v * this.out1.c + this.out2.v * this.out2.c)) < eps;
    }
}

function fact(n){
    var f=1;
    for (var i=2;i<=n;i++){f*=i;}
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
function calcSchemes(data){
    eps=0.001;
    var membs=[[0.8, 0.65],[0.4, 0.12],[0.64, 0.17], [.25,.01], [0.78,.44], [.56,.12]];

    var confs=fullHouse(data);
    var rez=[];
    for (var j=0;j<confs.length; j++){
        var conf = confs[j];
        var source=new Source(1000,0.014);
        var sink=new Sink();
        var nodes=[];

        for (var i=0;i<conf.length; i++){
            var im=conf[i];
            nodes[i]=new MemV(membs[im][0], membs[im][1],1);
            if (i===0) {
                nodes[i].in1=source.out1;
            }
            else {
                nodes[i].in1=nodes[i-1].out1;
            }
            nodes[i].calc();
            //console.log(im, nodes[i]);
        }
        sink.in1=nodes[conf.length-1].out1;
        console.log(sink.in1.c.toFixed(8), conf);
        rez[j]={};
        rez[j].c=sink.in1.c;
        rez[j].conf=conf;
    }
    var needSort=true;temp={};
    while (needSort){
        needSort=false;
        for (var i=0;i<rez.length-1;i++)
            if (rez[i].c>rez[i+1].c){
                needSort=true;
                tmp=rez[i].c;rez[i].c=rez[i+1].c;rez[i+1].c=tmp;
            }
    }
    console.log(rez);
}

var data=[5,1,1,2,3];
calcSchemes(data);

function calcOnWorkers(){
    var p = new Parallel([5,1,1,2]);
// Spawn our slow function
    p.spawn(function (data) {
        var kva=function (data) {
            var i = 0;
            while (++i < data * data) {}
            return i;
        };

        data=kva(data);
        //data=fullHouse("a","b");
        return data;
    }).then(function (data){
        console.log('worker finished-'+data)
    });
}

//s1=new Source(1000,0.17);
//mx=new Mixer(1000);
//mb=new Mem(0.15,0.95);
//sp=new Splitter(0.80);
//s2=new Sink();
//s3=new Sink();
//
//mx.in1=s1.out1;
//mx.in2=sp.out2;khuuiuiugy
//mb.in1=mx.out1;
//sp.in1=mb.out2;
//s3.in1=sp.out1;
//s2.in1=mb.out1;
//
//for (i=0;i<50;i++){
//    mx.calc();
//    mb.calc();
//    sp.calc();
//}