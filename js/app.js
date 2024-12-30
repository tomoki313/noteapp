let notes = [
    {
        id: '1',
        type: 'folder',
        name: 'マイノート',
        children: [
            { id: '2', type: 'note', name: '最初のノート', content: 'ここに内容を入力してください。' }
        ]
    }
];

let selectedNote = null;

function renderFolderTree() {
    const folderTree = document.getElementById('folderTree');
    folderTree.innerHTML = '';

    function renderItems(items, parent) {
        items.forEach(item => {
            const div = document.createElement('div');
            div.classList.add(item.type);

            const nameDiv = document.createElement('div');
            nameDiv.classList.add('nameDiv'); // 名前のための div

            const nameSpan = document.createElement('span');
            nameSpan.textContent = item.name;

            // ノート名クリックで選択
            nameSpan.onclick = (e) => {
                e.stopPropagation();
                if (item.type === 'note') {
                    selectNote(item);  // ノートを選択
                }
            };

            nameDiv.appendChild(nameSpan);

            // アクションボタンを格納するための div
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('item-actions');
            actionsDiv.style.display = 'none'; // 最初は非表示

            if (item.type === 'folder') {
                const renameFolderBtn = document.createElement('button');
                renameFolderBtn.textContent = '名前変更';
                renameFolderBtn.onclick = (e) => {
                    e.stopPropagation();
                    renameFolder(item.id);
                };
                actionsDiv.appendChild(renameFolderBtn);

                const deleteFolderBtn = document.createElement('button');
                deleteFolderBtn.textContent = '削除';
                deleteFolderBtn.onclick = (e) => {
                    e.stopPropagation();
                    deleteFolder(item.id);
                };
                actionsDiv.appendChild(deleteFolderBtn);

                const createNoteBtn = document.createElement('button');
                createNoteBtn.textContent = 'ノート追加';
                createNoteBtn.onclick = (e) => {
                    e.stopPropagation();
                    createNewNote(item.id); // フォルダー内でノートを追加
                };
                actionsDiv.appendChild(createNoteBtn);

                // フォルダー名クリックでアクションボタン表示
                nameDiv.onclick = (e) => {
                    e.stopPropagation();
                    actionsDiv.style.display = actionsDiv.style.display === 'none' ? 'block' : 'none';
                };
            }

            nameDiv.appendChild(actionsDiv);  // アクションボタンを名前と一緒に表示
            div.appendChild(nameDiv);

            if (item.type === 'folder' && item.children) {
                const childContainer = document.createElement('div');
                childContainer.classList.add('folder-content');
                renderItems(item.children, childContainer);
                div.appendChild(childContainer);
            }

            parent.appendChild(div);
        });
    }

    renderItems(notes, folderTree);
}


function selectNote(note) {
    selectedNote = note;
    document.getElementById('noteTitle').value = note.name;
    document.getElementById('noteContent').value = note.content || '';
    document.querySelectorAll('.note').forEach(el => el.classList.remove('selected'));
    
    // ノート選択時のクラス付与
    const selectedNoteDiv = document.querySelector(`.note span:contains('${note.name}')`);
    if (selectedNoteDiv) {
        selectedNoteDiv.parentElement.classList.add('selected');
    }
}

function saveNote() {
    if (selectedNote) {
        selectedNote.name = document.getElementById('noteTitle').value;
        selectedNote.content = document.getElementById('noteContent').value;
        renderFolderTree();  // ノートを保存したらフォルダーを再描画
    }
}

function deleteNote() {
    if (selectedNote) {
        const deleteFromArray = (arr) => {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].id === selectedNote.id) {
                    arr.splice(i, 1);
                    return true;
                }
                if (arr[i].children && deleteFromArray(arr[i].children)) {
                    return true;
                }
            }
            return false;
        };

        if (confirm('本当にこのノートを削除しますか？')) {
            deleteFromArray(notes);
            selectedNote = null;
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').value = '';
            renderFolderTree();  // フォルダーを再描画
        }
    }
}

function createNewFolder() {
    const folderName = prompt('新しいフォルダの名前を入力してください：');
    if (folderName) {
        notes.push({
            id: Date.now().toString(),
            type: 'folder',
            name: folderName,
            children: []
        });
        renderFolderTree();  // フォルダーを再描画
    }
}

function createNewNote(parentId = null) {
    const noteName = prompt('新しいノートの名前を入力してください：');
    if (noteName) {
        const newNote = {
            id: Date.now().toString(),
            type: 'note',
            name: noteName,
            content: ''
        };

        if (parentId) {
            const addToFolder = (items) => {
                for (let item of items) {
                    if (item.id === parentId) {
                        item.children = item.children || [];
                        item.children.push(newNote);  // 親フォルダーのchildrenに追加
                        return true;
                    }
                    if (item.children && addToFolder(item.children)) {
                        return true;
                    }
                }
                return false;
            };
            addToFolder(notes);  // ルートのnotes配列に対して追加
        } else {
            notes.push(newNote);
        }

        renderFolderTree();  // ツリーを再描画
        selectNote(newNote);  // 新しく追加したノートを選択
    }
}

function renameFolder(folderId) {
    const renameInArray = (arr) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === folderId) {
                const newName = prompt(`フォルダ "${arr[i].name}" の新しい名前を入力してください：`);
                if (newName) {
                    arr[i].name = newName;
                }
                return true;
            }
            if (arr[i].children && renameInArray(arr[i].children)) {
                return true;
            }
        }
        return false;
    };

    if (renameInArray(notes)) {
        renderFolderTree();  // フォルダー名変更後、再描画
    }
}

function deleteFolder(folderId) {
    const deleteFromArray = (arr) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === folderId) {
                if (confirm(`フォルダ "${arr[i].name}" とその中のすべてのノートを削除しますか？`)) {
                    arr.splice(i, 1);
                    return true;
                }
                return false;
            }
            if (arr[i].children && deleteFromArray(arr[i].children)) {
                return true;
            }
        }
        return false;
    };

    if (deleteFromArray(notes)) {
        selectedNote = null;
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
        renderFolderTree();  // フォルダーを再描画
    }
}

document.getElementById('newFolderBtn').onclick = () => createNewFolder();
document.getElementById('saveNoteBtn').onclick = saveNote;
document.getElementById('deleteNoteBtn').onclick = deleteNote;

// ページがロードされた時に最初のノートを選択
window.onload = () => {
    renderFolderTree();  // フォルダーツリーの描画
    const firstNote = notes[0].children[0]; // 「マイノート」フォルダ内の最初のノートを選択
    selectNote(firstNote);  // 最初のノートを選択して表示
};
