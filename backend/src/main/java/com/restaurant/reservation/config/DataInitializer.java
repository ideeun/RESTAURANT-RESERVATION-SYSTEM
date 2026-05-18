package com.restaurant.reservation.config;

import com.restaurant.reservation.entity.DiningTable;
import com.restaurant.reservation.entity.Role;
import com.restaurant.reservation.entity.User;
import com.restaurant.reservation.repository.DiningTableRepository;
import com.restaurant.reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds demo users and tables when running with profile {@code dev}.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DiningTableRepository diningTableRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .username("admin")
                    .email("admin@restaurant.com")
                    .passwordHash(passwordEncoder.encode("Admin123!"))
                    .role(Role.ADMIN)
                    .build());
            userRepository.save(User.builder()
                    .username("demo")
                    .email("demo@restaurant.com")
                    .passwordHash(passwordEncoder.encode("User123!"))
                    .role(Role.USER)
                    .build());
            log.info("Seeded users: admin/Admin123!, demo/User123!");
        }

        if (diningTableRepository.count() == 0) {
            diningTableRepository.save(DiningTable.builder().tableNumber(1).capacity(2).status("AVAILABLE").build());
            diningTableRepository.save(DiningTable.builder().tableNumber(2).capacity(4).status("AVAILABLE").build());
            diningTableRepository.save(DiningTable.builder().tableNumber(3).capacity(4).status("AVAILABLE").build());
            diningTableRepository.save(DiningTable.builder().tableNumber(4).capacity(6).status("AVAILABLE").build());
            diningTableRepository.save(DiningTable.builder().tableNumber(5).capacity(8).status("AVAILABLE").build());
            diningTableRepository.save(DiningTable.builder().tableNumber(6).capacity(2).status("MAINTENANCE").build());
            log.info("Seeded 6 dining tables");
        }
    }
}
