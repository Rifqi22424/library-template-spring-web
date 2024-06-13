package com.mangcoding.library.service;

import com.mangcoding.library.entity.Book;
import com.mangcoding.library.entity.Loan;
import com.mangcoding.library.entity.Member;
import com.mangcoding.library.repository.BookRepository;
import com.mangcoding.library.repository.LoanRepository;
import com.mangcoding.library.repository.MemberRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private MemberRepository memberRepository;

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    public Loan getLoanById(Long id) {
        return loanRepository.findById(id).orElse(null);
    }

    public Loan createLoan(Loan loan) {
        Book book = bookRepository.findById(loan.getBook().getId()).orElse(null);
        if (book == null) {
            throw new RuntimeException("Book not found");
        }

        Member member = memberRepository.findById(loan.getMember().getId()).orElse(null);
        if (member == null) {
            throw new RuntimeException("Member not found");
        }

        Optional<Loan> existingLoan = loanRepository.findByBookAndReturnDateIsNull(book);
        if (existingLoan.isPresent()) {
            throw new RuntimeException("Book is already loaned out");
        }

        return loanRepository.save(loan);
    }

    public Loan returnLoan(Long id) {
        Loan loan = loanRepository.findById(id).orElse(null);
        if (loan != null) {
            loan.setReturnDate(LocalDate.now());
            loanRepository.save(loan);
        }
        return loan;
    }

    public List<Loan> getLoansByMember(Member member) {
        return loanRepository.findByMember(member);
    }

    public void deleteLoan(Long id) {
        loanRepository.deleteById(id);
    }
}
