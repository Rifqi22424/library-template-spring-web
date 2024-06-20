document.addEventListener('DOMContentLoaded', function() {
    const bookForm = document.getElementById('bookForm');
    const memberForm = document.getElementById('memberForm');
    const loanForm = document.getElementById('loanForm');

    const bookList = document.getElementById('bookList');
    const memberList = document.getElementById('memberList');
    const loanList = document.getElementById('loanList');

    const editBookModal = new bootstrap.Modal(document.getElementById('editBookModal'));
    const editMemberModal = new bootstrap.Modal(document.getElementById('editMemberModal'));

    const saveBookChangesButton = document.getElementById('saveBookChanges');
    const saveMemberChangesButton = document.getElementById('saveMemberChanges');

    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.appendChild(document.createTextNode(message));
        document.querySelector('.container').prepend(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    async function handleFetch(response) {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        return response.json();
    }

    bookForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('bookAuthor').value;

        const book = { title, author };

        fetch('/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        })
        .then(handleFetch)
        .then(data => {
            addBookToList(data);
            showAlert('Book added successfully', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert(error.message, 'danger');
        });

        bookForm.reset();
    });

    memberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('memberName').value;
        const email = document.getElementById('memberEmail').value;

        const member = { name, email };

        fetch('/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        })
        .then(handleFetch)
        .then(data => {
            addMemberToList(data);
            showAlert('Member added successfully', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert(error.message, 'danger');
        });

        memberForm.reset();
    });

    loanForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const bookId = document.getElementById('loanBookId').value;
        const memberId = document.getElementById('loanMemberId').value;

        const loan = {
            book: { id: bookId },
            member: { id: memberId },
            loanDate: new Date().toISOString().split('T')[0] // Assuming loan date is today
        };

        fetch('/loans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loan)
        })
        .then(handleFetch)
        .then(data => {
            addLoanToList(data);
            showAlert('Loan added successfully', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert(error.message, 'danger');
        });

        loanForm.reset();
    });

    function editBook(id) {
        fetch(`/books/${id}`)
            .then(handleFetch)
            .then(book => {
                document.getElementById('editBookTitle').value = book.title;
                document.getElementById('editBookAuthor').value = book.author;
                document.getElementById('editBookId').value = book.id;
                editBookModal.show();
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert(error.message, 'danger');
            });
    }

    saveBookChangesButton.addEventListener('click', function() {
        const id = document.getElementById('editBookId').value;
        const title = document.getElementById('editBookTitle').value;
        const author = document.getElementById('editBookAuthor').value;

        const updatedBook = { id, title, author };

        fetch(`/books/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBook)
        })
        .then(handleFetch)
        .then(data => {
            updateBookInList(data);
            showAlert('Book updated successfully', 'success');
            editBookModal.hide();
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert(error.message, 'danger');
        });
    });

    function editMember(id) {
        fetch(`/members/${id}`)
            .then(handleFetch)
            .then(member => {
                document.getElementById('editMemberName').value = member.name;
                document.getElementById('editMemberEmail').value = member.email;
                document.getElementById('editMemberId').value = member.id;
                editMemberModal.show();
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert(error.message, 'danger');
            });
    }

    saveMemberChangesButton.addEventListener('click', function() {
        const id = document.getElementById('editMemberId').value;
        const name = document.getElementById('editMemberName').value;
        const email = document.getElementById('editMemberEmail').value;

        const updatedMember = { id, name, email };

        fetch(`/members/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedMember)
        })
        .then(handleFetch)
        .then(data => {
            updateMemberInList(data);
            showAlert('Member updated successfully', 'success');
            editMemberModal.hide();
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert(error.message, 'danger');
        });
    });

    function deleteBook(id) {
        fetch(`/books/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                removeBookFromList(id);
                showAlert('Book deleted successfully', 'success');
            } else {
                throw new Error('Failed to delete book');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert(error.message, 'danger');
        });
    }

    function deleteMember(id) {
        fetch(`/members/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                removeMemberFromList(id);
                showAlert('Member deleted successfully', 'success');
            } else {
                throw new Error('Failed to delete member');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert(error.message, 'danger');
        });
    }

    function returnBook(id) {
        fetch(`/loans/return/${id}`, {
            method: 'PUT'
        })
        .then(handleFetch)
        .then(data => {
            updateLoanInList(data);
            showAlert('Book returned successfully', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert(error.message, 'danger');
        });
    }

    function addBookToList(book) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.dataset.id = book.id;
        li.innerHTML = `
            <span>ID: ${book.id} - ${book.title} by ${book.author}</span>
            <div>
                <button class="btn btn-sm btn-info edit-book">Edit</button>
                <button class="btn btn-sm btn-danger delete-book">Delete</button>
            </div>
        `;
        bookList.appendChild(li);
    }

    function updateBookInList(book) {
        const items = bookList.querySelectorAll('li');
        items.forEach(item => {
            if (item.dataset.id == book.id) {
                item.querySelector('span').textContent = `ID: ${book.id} - ${book.title} by ${book.author}`;
            }
        });
    }

    function removeBookFromList(id) {
        const items = bookList.querySelectorAll('li');
        items.forEach(item => {
            if (item.dataset.id == id) {
                item.remove();
            }
        });
    }

    function addMemberToList(member) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.dataset.id = member.id;
        li.innerHTML = `
            <span>ID: ${member.id} - ${member.name} (${member.email})</span>
            <div>
                <button class="btn btn-sm btn-info edit-member">Edit</button>
                <button class="btn btn-sm btn-danger delete-member">Delete</button>
            </div>
        `;
        memberList.appendChild(li);
    }

    function updateMemberInList(member) {
        const items = memberList.querySelectorAll('li');
        items.forEach(item => {
            if (item.dataset.id == member.id) {
                item.querySelector('span').textContent = `ID: ${member.id} - ${member.name} (${member.email})`;
            }
        });
    }

    function removeMemberFromList(id) {
        const items = memberList.querySelectorAll('li');
        items.forEach(item => {
            if (item.dataset.id == id) {
                item.remove();
            }
        });
    }

    function addLoanToList(loan) {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.dataset.id = loan.id;
        li.innerHTML = `
            ID: ${loan.id} - Book ID: ${loan.book.id}, Member ID: ${loan.member.id}
            <button class="btn btn-sm btn-success return-loan">Return</button>
        `;
        loanList.appendChild(li);
    }

    function updateLoanInList(loan) {
        const items = loanList.querySelectorAll('li');
        items.forEach(item => {
            if (item.dataset.id == loan.id) {
                item.textContent = `ID: ${loan.id} - Book ID: ${loan.book.id}, Member ID: ${loan.member.id} (Returned)`;
            }
        });
    }

    bookList.addEventListener('click', function(e) {
        const id = e.target.closest('li').dataset.id;
        if (e.target.classList.contains('edit-book')) {
            editBook(id);
        } else if (e.target.classList.contains('delete-book')) {
            if (confirm('Are you sure you want to delete this book?')) {
                deleteBook(id);
            }
        }
    });

    memberList.addEventListener('click', function(e) {
        const id = e.target.closest('li').dataset.id;
        if (e.target.classList.contains('edit-member')) {
            editMember(id);
        } else if (e.target.classList.contains('delete-member')) {
            if (confirm('Are you sure you want to delete this member?')) {
                deleteMember(id);
            }
        }
    });

    loanList.addEventListener('click', function(e) {
        const id = e.target.closest('li').dataset.id;
        if (e.target.classList.contains('return-loan')) {
            returnBook(id);
        }
    });

    function loadBooks() {
        fetch('/books')
        .then(handleFetch)
        .then(data => {
            data.forEach(book => addBookToList(book));
        })
        .catch(error => console.error('Error:', error));
    }

    function loadMembers() {
        fetch('/members')
        .then(handleFetch)
        .then(data => {
            data.forEach(member => addMemberToList(member));
        })
        .catch(error => console.error('Error:', error));
    }

    function loadLoans() {
        fetch('/loans')
        .then(handleFetch)
        .then(data => {
            data.forEach(loan => addLoanToList(loan));
        })
        .catch(error => console.error('Error:', error));
    }
    // Initial load
    loadBooks();
    loadMembers();
    loadLoans();
});
