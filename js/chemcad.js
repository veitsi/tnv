var data=[5,0,2];
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
function Stream3c(v,c){
    this.v=v||null;
    this.c=c||[];
};
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

function Node(vmax,cmax,k){
    this.in1=new Stream3c();
    this.out1=new Stream3c();
    this.vmax=vmax|| 10;
    this.cmax=cmax||[1100,1100,1100];
    this.k=k||0.88;
    this.calc=function(){
        if (this.in1.v>this.vmax  || this.in1.c[0]> this.cmax[0]
        || this.in1.c[1]>this.cmax[1] || this.in1.c[2]>this.cmax[2]) return false;
        this.out1.v=this.in1.v;
        this.out1.c[0]=this.in1.c[0]*this.k[0];
        this.out1.c[1]=this.in1.c[1]*this.k[1];
        this.out1.c[2]=this.in1.c[2]*this.k[2];
        return true;
    }
}

//Узлы  для водоочистки
//
//1. Механический фильтр
//продуктивность  5-15м3/час верхняя граница, объем
//взвешенные вещества  до 1000мг/л К=0,99 , концентрация, верхняя граница
//ХПК до 1500 мгО/л К=0,25, свых=вх*к
//общее солесодержание до 1500мг/л К=0,001 , концентрация, свых=свх*к
//
//
//2. Адсорбционный фильтр
//продуктивность  2-10 м3/час
//взвешенные вещества  до 10 мг/л К=0,99
//ХПК до 1500 мгО/л К=0,99
//общее солесодержание до 1500мг/л К=0,001
//
//3. Обратноосмотическая мембрана
//продуктивность  1-5 м3/час
//взвешенные вещества  до 1мг/л К=0,99999
//ХПК до 15 мгО/л К=0,99
//общее солесодержание до 2500мг/л К=0,99
//
//4. Ультрафильтрационная мембрана
//продуктивность  5-7 м3/час
//взвешенные вещества  до 1500мг/л К=0,999
//ХПК до 1500 мгО/л К=0,75
//общее солесодержание до 1500мг/л К=0,1
function harringtone(){
    D=Math.power(1,1/3);
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
    var membvmaxs=[15, 10, 5, 7];
    var membcmaxs=[[1000, 1500, 1500],[10, 1500, 1500],[1, 15, 2500],[1500, 1500, 1500]];
    var membks=[[.99,.25,.001], [.99,.99,.001], [.99999,.99,.99], [.999,.75,.1]];
    //var membs=[[10, 0.65],[0.4, 0.12],[0.64, 0.17], [.25,.01], [0.78,.44], [.56,.12]];
    data=data||[0,1,2];

    var confs=fullHouse(data);
    var rez=[];
    for (var j=confs.length-1;j>=0; j--){
        var conf = confs[j];
        var source={out1:null};
        source.out1=new Stream3c(1,[2,2,1]);
        var sink={in1:null};
        sink.in1=new Stream3c();
        var nodes=[];
        var confOk=true;

        for (var i=0;i<conf.length; i++){
            var im=conf[i];
            //nodes[i]=new MemV(membs[im][0], membs[im][1],1);
            nodes[i]=new Node(membvmaxs[im], membcmaxs[im], membks[im]);
            if (i===0) {
                nodes[i].in1=source.out1;
            }
            else {
                nodes[i].in1=nodes[i-1].out1;
            }
            if (!nodes[i].calc()) {
                confOk=false;
                break;
            };
            //console.log(im, nodes[i]);
        }

        if (confOk){
            sink.in1=nodes[conf.length-1].out1;
            //console.log(sink.in1.c.toFixed(8), conf);
            var tmp={};
            tmp.c=[];
            //tmp.c=sink.in1.c;
            for (var i= 2;i>-1;i--){tmp.c[i]=sink.in1.c[i].toFixed(5);}
            tmp.conf=conf;
            rez.push(tmp);
        }
    }
    //var needSort=true;temp={};
    //while (needSort){
    //    needSort=false;
    //    for (var i=0;i<rez.length-1;i++)
    //        if (rez[i].c>rez[i+1].c){
    //            needSort=true;
    //            tmp=rez[i].c;rez[i].c=rez[i+1].c;rez[i+1].c=tmp;
    //        }
    //}
    console.log(rez);
    return rez;
}
//calcSchemes(data);

function calcOnWorkers(){
    var p = new Parallel([5,1,1,2]);
// Spawn our slow function
    p.spawn(function (data) {
        var kva=function (data) {
            var i = 0;
            while (++i < data * data) {}
            return i;
        };

        //data=kva(data);
        data=fullHouse("a","b");
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