const username = 'Warecario';
const repoGrid = document.getElementById('repoGrid');
const repoStatus = document.getElementById('repoStatus');
const refreshButton = document.getElementById('refreshButton');

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
      repoStatus.textContent = 'No repos found.';
      return;
    }

    renderRepos(filtered);
    repoStatus.textContent = `Showing ${filtered.length} repos.`;
  } catch (error) {
    repoGrid.innerHTML = `
      <li class="repo-item">
        <a href="https://github.com/${username}" target="_blank" rel="noreferrer">
          <h3>Could not load repos</h3>
          <p>Try again later or open the GitHub profile directly.</p>
        </a>
      </li>
    `;
    repoStatus.textContent = 'Unable to load repos.';
    console.error(error);
  }
}

function renderRepos(repos) {
  repoGrid.innerHTML = repos.map(repo => {
    const description = repo.description ? repo.description : 'No description.';
    const languageLabel = repo.language ? repo.language : 'Unknown';
    const updated = new Date(repo.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    return `
      <li class="repo-item">
        <a href="${repo.html_url}" target="_blank" rel="noreferrer">
          <h3>${repo.name}</h3>
          <p>${description}</p>
          <div class="repo-meta">
            <span class="repo-pill"><span></span>${languageLabel}</span>
            <span class="repo-pill"><span></span>★ ${repo.stargazers_count}</span>
            <span class="repo-pill"><span></span>Forks ${repo.forks_count}</span>
          </div>
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
