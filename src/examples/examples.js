//setTimeout(() => {
//    model.title = "jim, bobby, and sally";
//    model.users = [
//        {username:"jim", left: 0, departments: [1]},
//        {username:"bobby", left: 25, departments: [1,2]},
//        {username:"sally", left: 50, departments: [1,2,3]},
//    ];
//    model.frames++;
//    model.sin = Math.sin(model.frames) * 1000 + "px";
//}, 2000);
//
//setTimeout(() => {
//    model.title = "nobody";
//    model.users = [];
//    model.frames++;
//    model.sin = Math.sin(model.frames) * 1000 + "px";
//}, 4000);
//
//setTimeout(function animate() {
//    model.title = "sally only";
//    model.users = [
//        {username:"sally", left: 25, departments: [1,2,3]},
//    ];
//    model.frames++;
//    model.sin = Math.sin(model.frames / 100) * 100 + 100 + "px";
//    requestAnimationFrame(animate);
//}, 6000);
