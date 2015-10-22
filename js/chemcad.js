eps=0.001;
var membs=[[0.8, 0.65],[0.4, 0.12],[0.64, 0.17], [.25,.01], [0.78,.44], [.56,.12]];

var confs=fullHouse([0,3,1,2]);
for (var j=0;j<confs.length; j++){
    var conf = confs[j];
    var source=new Source(1000,0.014);
    var sink=new Sink();
    var nodes=[];

    for (var i=0;i<conf.length; i++){
        var im=conf[i];
        nodes[i]=new Mem(membs[im][0], membs[im][1],1);
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
    console.log(sink.in1.v, sink.in1.c, conf);
}




console.log();
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
