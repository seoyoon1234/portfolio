/* typing effect */

const text = [
"안녕하세요.",
"정보보안에 관심을 가지고 있는 고등학생입니다.",
"웹,앱 개발을 통해 정보보안을 공부하고 있습니다."
]

let index = 0
let charIndex = 0

function type(){

const typing = document.getElementById("typing")

if(charIndex < text[index].length){

typing.textContent += text[index][charIndex]
charIndex++

setTimeout(type,80)

}else{

setTimeout(()=>{

typing.textContent=""
charIndex=0
index++

if(index>=text.length){
index=0
}

type()

},1500)

}

}

type()



/* reveal animation */

const reveals = document.querySelectorAll(".reveal")

const observer = new IntersectionObserver(entries => {

entries.forEach(entry => {

if(entry.isIntersecting){
entry.target.classList.add("active")
}

})

})

reveals.forEach(el=>{
observer.observe(el)
})