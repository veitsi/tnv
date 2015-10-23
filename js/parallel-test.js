//    var p = new Parallel('forwards');
//    // Spawn a remote job (we'll see more on how to use then later)
//    p.spawn(function (data) {
//        data = data.split('').reverse().join('');
//        return data; }).then(function (data) { console.log(data) // logs sdrawrof
//    });
;
// Create a job
var p = new Parallel(10);
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