const username = 'Warecario';
const repoGrid = document.getElementById('repoGrid');

async function fetchRepos() {
  const endpoint = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;
  repoStatus.textContent = 'Fetching repos...';


  try {
    const response = await fetch(endpoint, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const repos = await response.json();
    const ignored = ['control', 'warecario.github.io'];
    const filtered = repos
      .filter(repo => !repo.fork && repo.private === false)
      .filter(repo => !ignored.includes(repo.name.toLowerCase()))
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 12);

    if (!filtered.length) {
      repoGrid.innerHTML = '<li class="repo-item">No public repositories available right now.</li>';
      return;
    }

    // Fetch pages info for each repo
    const reposWithPages = await Promise.all(filtered.map(async (repo) => {
      try {
        const detailResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}`, { cache: 'no-store' });
        if (detailResponse.ok) {
          const detail = await detailResponse.json();
          return { ...repo, pages: detail.pages };
        }
      } catch (e) {
        console.warn(`Failed to fetch details for ${repo.name}`);
      }
      return repo;
    }));

    renderRepos(reposWithPages);
  } catch (error) {
    repoGrid.innerHTML = `
      <li class="repo-item">
        <a href="https://github.com/${username}" target="_blank" rel="noreferrer">
          <h3>Could not load repos</h3>
          <p>Try again later or open the GitHub profile directly.</p>
        </a>
      </li>
    `
}

function renderRepos(repos) {
  repoGrid.innerHTML = repos.map(repo => {
    const description = repo.description ? repo.description : 'No description.';
    const languageLabel = repo.language ? repo.language : 'Unknown';
    const updated = new Date(repo.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const linkUrl = repo.pages && repo.pages.url ? repo.pages.url : repo.html_url;

    return `
      <li class="repo-item">
        <a href="${linkUrl}" target="_blank" rel="noreferrer">
          <h3>${repo.name}</h3>
          <p>${description}</p>
          <div class="status-bar">Updated ${updated}</div>
        </a>
      </li>
    `;
  }).join('');
}

refreshButton.addEventListener('click', () => {
  fetchRepos();
});

fetchRepos();
