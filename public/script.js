/* ==================================
   1. Typing & Animation
================================== */
const text = [
  "안녕하세요.",
  "정보보안에 관심을 가지고 있는 고등학생입니다.",
  "웹, 앱 개발을 통해 정보보안을 공부하고 있습니다."
];
let index = 0; let charIndex = 0;

function type() {
  const typing = document.getElementById("typing");
  if (!typing) return;
  if (charIndex < text[index].length) {
    typing.textContent += text[index][charIndex];
    charIndex++;
    setTimeout(type, 80);
  } else {
    setTimeout(() => {
      typing.textContent = ""; charIndex = 0; index++;
      if (index >= text.length) index = 0;
      type();
    }, 1500);
  }
}
type();

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("active");
  });
});
reveals.forEach(el => observer.observe(el));

/* ==================================
   2. 게시판 (LocalStorage)
================================== */
/* ==================================
   게시판 로직 (페이지네이션 추가)
================================== */
let currentPostId = null; 
let currentPage = 1;      // 현재 페이지 번호
const postsPerPage = 5;   // 한 페이지에 보여줄 게시글 수

document.addEventListener('DOMContentLoaded', fetchPosts);

function getLocalPosts() {
  const saved = localStorage.getItem('seoyoon_posts');
  return saved ? JSON.parse(saved) : [];
}

function saveLocalPosts(posts) {
  localStorage.setItem('seoyoon_posts', JSON.stringify(posts));
}

// 📌 핵심: 페이지네이션이 적용된 목록 그리기
function fetchPosts() {
  const allPosts = getLocalPosts();
  const postList = document.getElementById('postList');
  if (!postList) return;
  
  postList.innerHTML = '';

  // 1. 현재 페이지에 해당하는 데이터만 계산해서 자르기
  // 공식: (현재페이지 - 1) * 페이지당개수 ~ 현재페이지 * 페이지당개수
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = allPosts.slice(startIndex, endIndex);

  // 2. 잘린 데이터만 화면에 출력
  paginatedPosts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.onclick = () => openModal(post.id, post.title, post.content);

    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-title">${post.title}</div>
            <button class="delete-btn" onclick="event.stopPropagation(); deletePost(${post.id})">❌ 삭제</button>
        </div>
        <div class="post-content">${post.content}</div>
    `;
    postList.appendChild(postElement);
  });

  // 3. 페이지네이션 버튼 상태 업데이트
  updatePaginationButtons(allPosts.length);
}

// 🔘 버튼 활성화/비활성화 제어
function updatePaginationButtons(totalPosts) {
  const prevBtn = document.querySelector('.pagination button:first-child');
  const nextBtn = document.querySelector('.pagination button:last-child');
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // 이전 버튼: 1페이지면 비활성화
  prevBtn.disabled = (currentPage === 1);
  prevBtn.style.opacity = (currentPage === 1) ? "0.5" : "1";
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchPosts();
    }
  };

  // 다음 버튼: 마지막 페이지면 비활성화
  nextBtn.disabled = (currentPage >= totalPages || totalPages === 0);
  nextBtn.style.opacity = (currentPage >= totalPages || totalPages === 0) ? "0.5" : "1";
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchPosts();
    }
  };
}

// 🚀 새 글 작성 (작성 후 1페이지로 이동)
function createPost() {
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;

  if (!title || !content) return alert('제목과 내용을 모두 입력해주세요!');

  const posts = getLocalPosts();
  const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
  
  posts.unshift({ id: newId, title, content }); 
  saveLocalPosts(posts);

  document.getElementById('postTitle').value = '';
  document.getElementById('postContent').value = '';
  
  currentPage = 1; // 새 글 쓰면 첫 페이지로 이동
  fetchPosts();
}

// ❌ 글 삭제
function deletePost(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  let posts = getLocalPosts();
  posts = posts.filter(post => post.id !== id);
  saveLocalPosts(posts);
  
  // 만약 현재 페이지에 글이 하나도 없으면 이전 페이지로 이동
  const totalPages = Math.ceil(posts.length / postsPerPage);
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }
  
  fetchPosts();
}

// (나머지 모달 관련 openModal, closeModal, saveEditPost 등은 기존과 동일)