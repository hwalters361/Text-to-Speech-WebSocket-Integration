import axios from 'axios';

export const getDataFromAPI = async (searchTerm: string) => {
  try {
    // API URL
    const url = 'https://jsonplaceholder.typicode.com/posts';

    // If there's a search term, filter posts by title
    const response = await axios.get(url);
    const posts = response.data;

    // Filter posts based on the search term (case-insensitive)
    const filteredPosts = posts.filter((post: { title: string }) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredPosts;
  } catch (error) {
    console.error('Error fetching data from API:', error);
    return [];
  }
};
