let posts = [];
let currentPage = 1;
const postsPerPage = 5;

function addPost(){
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  if(!title || !content) return;

  posts.unshift({title, content});
  render();

  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
}

function render(){
  const list = document.getElementById("postList");
  list.innerHTML = "";

  const start = (currentPage - 1) * postsPerPage;
  const end = start + postsPerPage;

  const pagePosts = posts.slice(start, end);

  pagePosts.forEach((post, index)=>{
    const realIndex = start + index;

    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <div class="post-header">
        <div class="post-title">${post.title}</div>
        <button class="delete-btn">삭제</button>
      </div>
      <div class="post-content">${post.content.slice(0,40)}...</div>
    `;

    div.onclick = () => openModal(realIndex);

    div.querySelector(".delete-btn").onclick = (e)=>{
      e.stopPropagation();
      deletePost(realIndex);
    };

    list.appendChild(div);
  });

  updatePageInfo();
}

function deletePost(index){
  posts.splice(index, 1);

  const maxPage = Math.ceil(posts.length / postsPerPage);
  if(currentPage > maxPage) currentPage = maxPage || 1;

  render();
}

function nextPage(){
  const maxPage = Math.ceil(posts.length / postsPerPage);
  if(currentPage < maxPage){
    currentPage++;
    render();
  }
}

function prevPage(){
  if(currentPage > 1){
    currentPage--;
    render();
  }
}

function updatePageInfo(){
  const maxPage = Math.ceil(posts.length / postsPerPage) || 1;
  document.getElementById("pageInfo").innerText =
    `${currentPage} / ${maxPage}`;
}

function openModal(i){
  document.getElementById("modalTitle").innerText = posts[i].title;
  document.getElementById("modalContent").innerText = posts[i].content;
  document.getElementById("modal").style.display = "flex";
}

function closeModal(){
  document.getElementById("modal").style.display = "none";
}