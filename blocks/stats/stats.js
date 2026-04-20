/**
 * Stats Block
 *
 * Authoring: Create a table with the block name "stats".
 * Each row has two columns:
 *   - Column 1: The metric value (e.g. "500+")
 *   - Column 2: The label/description (e.g. "Projects Delivered")
 *
 * Example table:
 * | stats |                    |
 * |-------|--------------------|
 * | 500+  | Projects Delivered |
 * | 99%   | Uptime Guaranteed  |
 * | 24/7  | Customer Support   |
 * | 50+   | Countries Served   |
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Build stats list
  const statsList = document.createElement('ul');
  statsList.classList.add('stats-list');

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const value = cells[0]?.textContent.trim() || '';
    const label = cells[1]?.textContent.trim() || '';

    const item = document.createElement('li');
    item.classList.add('stats-item');

    const valueEl = document.createElement('span');
    valueEl.classList.add('stats-value');
    valueEl.textContent = value;

    const labelEl = document.createElement('span');
    labelEl.classList.add('stats-label');
    labelEl.textContent = label;

    item.append(valueEl, labelEl);
    statsList.append(item);
  });

  block.innerHTML = '';
  block.append(statsList);
}
