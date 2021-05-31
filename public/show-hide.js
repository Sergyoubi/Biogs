
const profilePic = document.getElementById("littleProfile");
const menu = document.getElementById("profileMenu");

profilePic.addEventListener('click', () => {
    menu.style.display = "block"
});


window.addEventListener('mouseup',function(e){

    if(e.target != menu && e.target.parentNode != menu){
        menu.style.display = 'none';
    }
    
});


/*
document.onclick = check;
function check(e){
    var target = (e && e.target);
    if (!checkParent(target, elementToHide)) {
        
        if (checkParent(target, profilePic)) {
        
            if (elementToHide.classList.contains("invisible")) {

                //elementToHide.style.left = profilePic.getBoundingClientRect().left + 'px';
                elementToHide.classList.remove("invisible");

            } else {
                elementToHide.classList.add("invisible");
            }
        } else {
            // click both outside link and outside menu, hide menu
            elementToHide.classList.add("invisible");
        }
    }
}

function checkParent(t, elm) {
    while(t.parentNode) {
        if( t == elm ) {return true;}
        t = t.parentNode;
    }
    return false;
}

*/


