const save_button = document.getElementById('save_button');
const save_as_button = document.getElementById('save_as_button');
const open_button = document.getElementById('open_button');
const file_content = document.getElementById('file_content');

let current_file_path = '';

save_button.addEventListener('click', async () => {
  const data = file_content.textContent;
  if (data && current_file_path) {
    await window.native.save_file(current_file_path, data);
    update_window_title(current_file_path);
  }
});

save_as_button.addEventListener('click', async () => {
  const data = file_content.textContent;
  if (data) {
    const new_path = await window.native.save_file_as(current_file_path, data);
    if (new_path) {
      current_file_path = new_path;
      update_window_title(new_path);
    }
  }
});

open_button.addEventListener('click', async () => {
  const file = await window.native.open_file_dialog(current_file_path);
  if (file) {
    file_content.textContent = file.data;
    current_file_path = file.file_path;
    update_window_title(file.file_path);
  }
});

window.native.on_file_opened((file) => {
  file_content.textContent = file.data;
  current_file_path = file.file_path;
  update_window_title(file.file_path);
});

function update_window_title(file_path) {
  document.title = file_path ? `${file_path} - Electron File Transfer` : 'Electron File Transfer';
}
