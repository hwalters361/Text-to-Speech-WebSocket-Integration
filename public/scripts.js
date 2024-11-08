document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting normally
    
    const searchTerm = document.getElementById('searchInput').value;
    
    // Make a GET request to the backend API to fetch posts based on the search term
    fetch(`/api/posts?search=${encodeURIComponent(searchTerm)}`)
      .then(response => response.json())
      .then(data => {
        const postList = document.getElementById('postList');
        postList.innerHTML = ''; // Clear previous results
  
        if (data.length === 0) {
          postList.innerHTML = '<p>No posts found.</p>';
        } else {
          const ul = document.createElement('ul');
          data.forEach(post => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${post.title}</strong>: ${post.body}`;
            ul.appendChild(li);
          });
          postList.appendChild(ul);
        }
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
      });
  });
  