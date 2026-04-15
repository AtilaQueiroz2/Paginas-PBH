document.addEventListener('DOMContentLoaded', () => {
  // ===== STORAGE LAYER (JSON via localStorage) =====
  const STORAGE_KEY = 'mailflow_agendamentos';

  function getAgendamentos() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  function saveAgendamentos(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function addAgendamento(entry) {
    const list = getAgendamentos();
    entry.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    entry.criadoEm = new Date().toISOString();
    entry.status = 'occupied'; // Default: Ocupado
    list.push(entry);
    saveAgendamentos(list);
    return entry;
  }

  function getSlotStatus(dateKey, periodo) {
    const list = getAgendamentos();
    return list.find(a => a.data === dateKey && a.periodo === periodo);
  }

  // Monta um objeto de lookup rápido por data para o calendário
  function buildSlotsMap() {
    const list = getAgendamentos();
    const map = {};
    list.forEach(a => {
      if (!map[a.data]) map[a.data] = {};
      map[a.data][a.periodo] = { status: a.status, title: a.assunto };
    });
    return map;
  }

  // ===== NAVIGATION =====
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  function switchTab(targetId) {
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.dataset.target === targetId) item.classList.add('active');
    });
    tabPanes.forEach(pane => {
      pane.classList.remove('active');
      if (pane.id === targetId) pane.classList.add('active');
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.target));
  });

  const btnCloseForm = document.getElementById('btn-close-form');
  if (btnCloseForm) {
    btnCloseForm.addEventListener('click', () => switchTab('tab-calendar'));
  }

  // ===== CALENDAR =====
  const calendarGrid = document.getElementById('calendar-grid');
  const monthTitle = document.getElementById('calendar-month-title');
  const btnPrev = document.getElementById('prev-month');
  const btnNext = document.getElementById('next-month');

  const now = new Date();
  let currentDate = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  function renderCalendar() {
    calendarGrid.innerHTML = '';
    const slotsMap = buildSlotsMap();

    daysOfWeek.forEach(day => {
      const el = document.createElement('div');
      el.className = 'calendar-day-header';
      el.innerText = day;
      calendarGrid.appendChild(el);
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthTitle.innerText = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'calendar-day empty';
      calendarGrid.appendChild(emptyEl);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';

      const numEl = document.createElement('span');
      numEl.className = 'date-number';
      numEl.innerText = i;
      dayEl.appendChild(numEl);

      const dayStr = String(i).padStart(2, '0');
      const monthStr = String(month + 1).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;

      const dow = new Date(year, month, i).getDay();
      if (dow === 0 || dow === 6) {
        dayEl.classList.add('weekend');
        const lbl = document.createElement('div');
        lbl.className = 'weekend-label';
        lbl.innerText = 'Fim de Semana';
        dayEl.appendChild(lbl);
        calendarGrid.appendChild(dayEl);
        continue;
      }

      const dbDay = slotsMap[dateKey];

      // Manhã
      const slotManha = document.createElement('div');
      if (dbDay && dbDay.manha) {
        if (dbDay.manha.status === 'dispatched') {
          slotManha.className = 'slot dispatched';
          slotManha.innerHTML = `<i class="ri-mail-check-fill"></i> Manhã: Disparado`;
        } else {
          slotManha.className = 'slot busy';
          slotManha.innerHTML = `<i class="ri-close-circle-fill"></i> Manhã: Ocupado`;
        }
      } else {
        slotManha.className = 'slot free';
        slotManha.innerHTML = `<i class="ri-check-line"></i> Manhã: Livre`;
      }

      // Tarde
      const slotTarde = document.createElement('div');
      if (dbDay && dbDay.tarde) {
        if (dbDay.tarde.status === 'dispatched') {
          slotTarde.className = 'slot dispatched';
          slotTarde.innerHTML = `<i class="ri-mail-check-fill"></i> Tarde: Disparado`;
        } else {
          slotTarde.className = 'slot busy';
          slotTarde.innerHTML = `<i class="ri-close-circle-fill"></i> Tarde: Ocupado`;
        }
      } else {
        slotTarde.className = 'slot free';
        slotTarde.innerHTML = `<i class="ri-check-line"></i> Tarde: Livre`;
      }

      dayEl.appendChild(slotManha);
      dayEl.appendChild(slotTarde);

      dayEl.style.cursor = 'pointer';
      dayEl.addEventListener('click', () => {
        switchTab('tab-nova-solicitacao');
        document.getElementById('data-disparo').value = dateKey;
      });

      calendarGrid.appendChild(dayEl);
    }
  }

  btnPrev.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });
  btnNext.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  renderCalendar();

  // ===== FILE UPLOAD (Base64) =====
  const uploadZone = document.querySelector('.upload-zone');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.accept = 'image/*,.pdf,.doc,.docx';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  let uploadedFiles = [];

  uploadZone.addEventListener('click', () => fileInput.click());

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--primary-color)';
    uploadZone.style.background = '#eef2ff';
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
    fileInput.value = '';
  });

  function handleFiles(fileList) {
    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          base64: e.target.result
        });
        renderFileList();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderFileList() {
    let listEl = document.getElementById('file-list');
    if (!listEl) {
      listEl = document.createElement('div');
      listEl.id = 'file-list';
      listEl.className = 'file-list';
      uploadZone.parentNode.appendChild(listEl);
    }
    listEl.innerHTML = uploadedFiles.map((f, idx) => `
      <div class="file-item">
        <i class="${f.type.startsWith('image/') ? 'ri-image-line' : 'ri-file-line'}"></i>
        <span>${f.name}</span>
        <button type="button" class="btn-remove-file" data-idx="${idx}"><i class="ri-close-line"></i></button>
      </div>
    `).join('');

    listEl.querySelectorAll('.btn-remove-file').forEach(btn => {
      btn.addEventListener('click', () => {
        uploadedFiles.splice(parseInt(btn.dataset.idx), 1);
        renderFileList();
      });
    });
  }

  // ===== WYSIWYG =====
  let savedSelection = null;

  function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) savedSelection = sel.getRangeAt(0).cloneRange();
  }

  function restoreSelection() {
    if (savedSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection);
    }
  }

  const linkOverlay = document.getElementById('link-modal-overlay');
  const linkTextInput = document.getElementById('link-text');
  const linkUrlInput = document.getElementById('link-url');

  function openLinkModal() {
    saveSelection();
    const sel = window.getSelection();
    linkTextInput.value = sel.toString() || '';
    linkUrlInput.value = '';
    linkOverlay.classList.add('visible');
    linkUrlInput.focus();
  }

  function closeLinkModal() {
    linkOverlay.classList.remove('visible');
  }

  document.getElementById('link-modal-close').addEventListener('click', closeLinkModal);
  document.getElementById('link-modal-cancel').addEventListener('click', closeLinkModal);
  linkOverlay.addEventListener('click', (e) => {
    if (e.target === linkOverlay) closeLinkModal();
  });

  document.getElementById('link-modal-apply').addEventListener('click', () => {
    const text = linkTextInput.value.trim();
    const url = linkUrlInput.value.trim();
    if (!url) return;

    restoreSelection();
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const link = document.createElement('a');
      link.href = url;
      link.textContent = text || url;
      link.target = '_blank';
      range.insertNode(link);
      range.setStartAfter(link);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    closeLinkModal();
    document.getElementById('conteudo').focus();
  });

  document.querySelectorAll('.wysiwyg-toolbar button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const command = btn.dataset.command;
      if (command === 'createLink') { openLinkModal(); return; }
      document.execCommand(command, false, null);
      btn.classList.toggle('active', document.queryCommandState(command));
      document.getElementById('conteudo').focus();
    });
  });

  document.getElementById('conteudo').addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.open(link.href, '_blank');
    }
  });

  // ===== FORM SUBMISSION (Real localStorage) =====
  const form = document.getElementById('agendamento-form');
  const formMsg = document.getElementById('form-msg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formMsg.className = 'alert hidden';

    const dataInput = document.getElementById('data-disparo').value;
    const periodo = document.getElementById('periodo-disparo').value;
    const nomeSolicitante = document.getElementById('nome-solicitante').value;
    const matricula = document.getElementById('matricula').value;
    const orgao = document.getElementById('orgao').value;
    const assunto = document.getElementById('assunto').value;
    const conteudo = document.getElementById('conteudo').innerHTML;

    if (!dataInput || !periodo) return;

    // Validação: slot já ocupado?
    const existing = getSlotStatus(dataInput, periodo);
    if (existing) {
      formMsg.textContent = 'Erro: Já existe um agendamento para esta data e período. Escolha outro horário.';
      formMsg.classList.remove('hidden');
      formMsg.classList.add('error');
      return;
    }

    // Salvar no localStorage
    const entry = addAgendamento({
      data: dataInput,
      periodo: periodo,
      nomeSolicitante: nomeSolicitante,
      matricula: matricula,
      orgao: orgao,
      assunto: assunto,
      conteudo: conteudo,
      anexos: uploadedFiles.map(f => ({ name: f.name, type: f.type, base64: f.base64 }))
    });

    formMsg.innerHTML = `<i class="ri-checkbox-circle-fill"></i> Disparo agendado com sucesso! ID: <strong>${entry.id}</strong>`;
    formMsg.classList.remove('hidden');
    formMsg.classList.add('success');

    // Limpar formulário
    form.reset();
    document.getElementById('conteudo').innerHTML = '';
    uploadedFiles = [];
    const fileList = document.getElementById('file-list');
    if (fileList) fileList.innerHTML = '';

    // Atualizar calendário imediatamente
    renderCalendar();
  });

});
