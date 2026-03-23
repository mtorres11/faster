import { HttpJsonError } from '../../infrastructure/http/fetch-json.js';
export function bootstrapPodcastsFeature(ctx) {
    const root = document.getElementById('podcasts-content');
    if (!root)
        return;
    ctx.podcastCatalog
        .listEpisodes()
        .then(eps => ctx.podcastCatalog.getDailyEpisode().then(daily => ({ eps, daily })))
        .then(({ eps, daily }) => {
        let html = '<h3>Daily</h3>';
        if (daily) {
            html +=
                '<div class="podcast-daily"><p><strong>' +
                    escapeHtml(daily.title) +
                    '</strong></p>' +
                    '<audio controls preload="none" src="' +
                    escapeAttr(daily.audioUrl) +
                    '"></audio></div>';
        }
        else {
            html += '<p class="description">No daily episode configured.</p>';
        }
        html += '<h3>All episodes</h3><ul class="podcast-list">';
        eps.forEach(e => {
            html +=
                '<li><strong>' +
                    escapeHtml(e.title) +
                    '</strong> <span class="topic">(' +
                    escapeHtml(e.topic || '') +
                    ')</span><br><audio controls preload="none" src="' +
                    escapeAttr(e.audioUrl) +
                    '"></audio></li>';
        });
        html += '</ul>';
        root.innerHTML = html;
    })
        .catch(e => {
        const msg = e instanceof HttpJsonError
            ? e.message
            : e instanceof Error
                ? e.message
                : 'Failed to load podcasts.';
        root.innerHTML = '<p class="sword-error" role="alert">' + escapeHtml(msg) + '</p>';
    });
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function escapeAttr(text) {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
