package com.ninjaruss.portfolio.repository;

import com.ninjaruss.portfolio.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    // You get basic CRUD methods for free here
    // (@Repository annotation is optional if you extend JpaRepository)
    
    // Spring boot handles database connections and transactions automatically with @Repository annotation
    // Basically, you can use this interface to perform CRUD operations on User entities
    // without needing to implement any methods.

    // TODO: Add custom query methods if needed
}
