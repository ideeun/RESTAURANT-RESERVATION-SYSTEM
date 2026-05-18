package com.restaurant.reservation.config;

import com.restaurant.reservation.entity.*;
import com.restaurant.reservation.repository.BranchRepository;
import com.restaurant.reservation.repository.DiningTableRepository;
import com.restaurant.reservation.repository.HallRepository;
import com.restaurant.reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final HallRepository hallRepository;
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

        // Сид только при пустой БД (после create-drop / первого запуска)
        if (branchRepository.count() == 0 && hallRepository.count() == 0) {
            Branch almaty = branchRepository.save(Branch.builder()
                    .name("French Touch — Алматы")
                    .address("пр. Абая 150")
                    .phone("+7 727 000 00 01")
                    .build());
            Branch astana = branchRepository.save(Branch.builder()
                    .name("French Touch — Астана")
                    .address("ул. Кенесары 20")
                    .phone("+7 717 000 00 02")
                    .build());

            Hall mainAlmaty = hallRepository.save(Hall.builder()
                    .branch(almaty).name("Основной зал").description("Главный зал").build());
            Hall terraceAlmaty = hallRepository.save(Hall.builder()
                    .branch(almaty).name("Терраса").description("Летняя терраса").build());
            Hall mainAstana = hallRepository.save(Hall.builder()
                    .branch(astana).name("Основной зал").description("Главный зал").build());

            seedTables(mainAlmaty);
            seedTables(terraceAlmaty);
            seedTables(mainAstana);

            log.info("Seeded branches, halls and tables");
        }
    }

    private void seedTables(Hall hall) {
        int[][] layout = {
                {1, 2, 95, 95, 32},
                {2, 4, 255, 130, 36},
                {3, 4, 355, 130, 36},
                {4, 6, 305, 235, 42},
                {5, 8, 175, 365, 48},
                {6, 2, 470, 250, 28},
        };
        for (int[] row : layout) {
            diningTableRepository.save(DiningTable.builder()
                    .hall(hall)
                    .tableNumber(row[0])
                    .capacity(row[1])
                    .posX(row[2])
                    .posY(row[3])
                    .shape(row[0] == 5 ? "rect" : "circle")
                    .status(row[0] == 6 ? "MAINTENANCE" : "AVAILABLE")
                    .build());
        }
    }
}
