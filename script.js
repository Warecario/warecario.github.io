const username = 'Warecario';
const repoGrid = document.getElementById('repoGrid');
const repoStatus = document.getElementById('repoStatus');

async function fetchRepos() {
  const endpoint = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const repos = await response.json();
    const ignored = ['control', 'warecario.github.io'];
    const filtered = repos
      .filter(repo => !repo.fork && repo.private === false)
      .filter(repo => !ignored.includes(repo.name.toLowerCase()))
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 20);

    if (!filtered.length) {
      repoGrid.innerHTML = '<div class="repo-item">No public repositories available right now.</div>';
      if (repoStatus) repoStatus.style.display = 'none';
      return;
    }

    if (repoStatus) repoStatus.style.display = 'none';
    renderRepos(filtered);
  } catch (error) {
    if (repoStatus) repoStatus.textContent = '⚠ Failed to load repos';
    repoGrid.innerHTML = `
      <div class="repo-item">
        <a href="https://github.com/${username}" target="_blank" rel="noreferrer">
          <h3>Could not load repos</h3>
          <p>Try visiting my GitHub profile or try refreshing the page.</p>
        </a>
      </div>
    `;
    console.error('Repo fetch error:', error);
  }
}

function renderRepos(repos) {
  repoGrid.innerHTML = repos.map(repo => {
    const description = repo.description || 'No description.';
    const updated = new Date(repo.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    return `
      <div class="repo-item">
        <a href="${repo.html_url}" target="_blank" rel="noreferrer">
          <h3>${repo.name}</h3>
          <p>${description}</p>
          <div class="status-bar">Updated ${updated}</div>
        </a>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', fetchRepos);
