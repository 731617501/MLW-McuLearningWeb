<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps<{
  content: string;
}>();

const renderedContent = ref('');

const renderMarkdown = async (markdown: string) => {
  if (!markdown) {
    renderedContent.value = '';
    return;
  }
  try {
    const rawHtml = await marked.parse(markdown);
    renderedContent.value = DOMPurify.sanitize(rawHtml);
  } catch (error) {
    console.error('Markdown rendering error:', error);
    renderedContent.value = '<p class="error">Error rendering markdown content.</p>';
  }
};

watch(() => props.content, (newContent) => {
  renderMarkdown(newContent);
}, { immediate: true });

</script>

<template>
  <div class="markdown-viewer" v-html="renderedContent"></div>
</template>

<style>
.markdown-viewer {
  color: var(--ctp-text);
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.markdown-viewer h1,
.markdown-viewer h2,
.markdown-viewer h3,
.markdown-viewer h4,
.markdown-viewer h5,
.markdown-viewer h6 {
  color: var(--ctp-blue);
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.markdown-viewer h1 { font-size: 2em; border-bottom: 1px solid var(--ctp-surface1); padding-bottom: 0.3em; }
.markdown-viewer h2 { font-size: 1.5em; }
.markdown-viewer h3 { font-size: 1.25em; }

.markdown-viewer p {
  margin-bottom: 1em;
}

.markdown-viewer ul,
.markdown-viewer ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-viewer li {
  margin-bottom: 0.25em;
}

.markdown-viewer code {
  background-color: var(--ctp-surface1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
  color: var(--ctp-mauve);
}

.markdown-viewer pre {
  background-color: var(--ctp-mantle);
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1em;
  border: 1px solid var(--ctp-surface1);
}

.markdown-viewer pre code {
  background-color: transparent;
  padding: 0;
  color: var(--ctp-text);
  font-size: 0.9em;
}

.markdown-viewer blockquote {
  border-left: 4px solid var(--ctp-overlay0);
  margin: 0 0 1em 0;
  padding-left: 1em;
  color: var(--ctp-subtext0);
}

.markdown-viewer a {
  color: var(--ctp-blue);
  text-decoration: none;
}

.markdown-viewer a:hover {
  text-decoration: underline;
}

.markdown-viewer table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
}

.markdown-viewer th,
.markdown-viewer td {
  border: 1px solid var(--ctp-surface1);
  padding: 0.5em;
  text-align: left;
}

.markdown-viewer th {
  background-color: var(--ctp-surface0);
  font-weight: 600;
}

.markdown-viewer img {
  max-width: 100%;
  border-radius: 8px;
  margin: 1em 0;
}

.markdown-viewer hr {
  border: none;
  border-top: 1px solid var(--ctp-surface1);
  margin: 2em 0;
}
</style>
