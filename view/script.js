// Blogok lekérése és megjelenítése
async function fetchBlogs() {
  const res = await fetch('/blogs');
  const blogs = await res.json();
  const blogsDiv = document.getElementById('blogs');
  blogsDiv.innerHTML = ''; // Töröljük az előző tartalmat
  blogs.forEach(blog => {
    const blogCard = document.createElement('div');
    blogCard.classList.add('blog-card');
    blogCard.innerHTML = `
      <h3>${blog.title}</h3>
      <p>${blog.content}</p>
      <small>Szerző: ${blog.author}</small><br>
      <small>Kategória: ${blog.category}</small><br>
      <small>Létrehozva: ${new Date(blog.created_at).toLocaleString()}</small><br>
      <small>Utoljára frissítve: ${new Date(blog.updated_at).toLocaleString()}</small><br>
      <button onclick="editBlog(${blog.id}, '${blog.author}', '${blog.title}', '${blog.category}', '${blog.content}', '${blog.created_at}')">Szerkesztés</button>
      <button onclick="deleteBlog(${blog.id})">Törlés</button>
    `;
    blogsDiv.appendChild(blogCard);
  });
}

// Blog törlése
async function deleteBlog(id) {
  await fetch(`/blogs/${id}`, { method: 'DELETE' });
  await fetchBlogs(); // Frissítjük a blogok listáját
}

// Eseménykezelő referenciák
let currentSubmitHandler = createBlog;

function setFormSubmitHandler(handler) {
  const form = document.getElementById('new-blog-form');
  form.removeEventListener('submit', currentSubmitHandler);
  form.addEventListener('submit', handler);
  currentSubmitHandler = handler;
}

// Blog szerkesztése
function editBlog(id, author, title, category, content, createdAt) {
  document.getElementById('author').value = author;
  document.getElementById('title').value = title;
  document.getElementById('category').value = category;
  document.getElementById('content').value = content;

  const formTitle = document.getElementById('form-title');
  formTitle.textContent = "Blog szerkesztése"; // Update the title

  const form = document.getElementById('new-blog-form');
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.textContent = "Mentés";

  // Új eseménykezelő
  async function submitEdit(e) {
    e.preventDefault();
    const updatedTitle = document.getElementById('title').value;
    const updatedCategory = document.getElementById('category').value;
    const updatedContent = document.getElementById('content').value;

    const res = await fetch(`/blogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updatedTitle,
        category: updatedCategory,
        content: updatedContent,
        created_at: createdAt
      })
    });

    if (res.ok) {
      form.reset();
      submitButton.textContent = "Létrehozás";
      formTitle.textContent = "Új Blog Létrehozása"; // Reset the title
      setFormSubmitHandler(createBlog); // Visszaállítjuk az eredeti submitot
      await fetchBlogs();
    } else {
      console.error("Hiba történt a blog frissítése során.");
    }
  }

  setFormSubmitHandler(submitEdit);
}

// Új blog létrehozása
async function createBlog(e) {
  e.preventDefault();
  const author = document.getElementById('author').value;
  const title = document.getElementById('title').value;
  const category = document.getElementById('category').value;
  const content = document.getElementById('content').value;

  await fetch('/blogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, title, category, content })
  });

  document.getElementById('new-blog-form').reset();
  await fetchBlogs();
}

// Eseménykezelő beállítása induláskor
setFormSubmitHandler(createBlog);

// Blogok betöltése az oldal betöltésekor
fetchBlogs();