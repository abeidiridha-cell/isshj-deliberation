const examForm = document.getElementById('exam-form');
const examList = document.getElementById('exam-list');

async function loadExams() {
  const response = await fetch('/api/exams');
  const exams = await response.json();
  examList.innerHTML = '';
  exams.forEach(exam => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${exam.student}</td>
      <td>${exam.course}</td>
      <td>${exam.date}</td>
      <td>${exam.grade}</td>
      <td>${exam.decision}</td>
      <td>
        <button class="delete-btn" data-id="${exam.id}">Supprimer</button>
      </td>
    `;
    examList.appendChild(row);
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      await fetch(`/api/exams/${id}`, { method: 'DELETE' });
      loadExams();
    });
  });
}

examForm.addEventListener('submit', async event => {
  event.preventDefault();
  const payload = {
    student: document.getElementById('student').value.trim(),
    course: document.getElementById('course').value.trim(),
    date: document.getElementById('date').value,
    grade: document.getElementById('grade').value,
    decision: document.getElementById('decision').value
  };

  await fetch('/api/exams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  examForm.reset();
  loadExams();
});

loadExams();
