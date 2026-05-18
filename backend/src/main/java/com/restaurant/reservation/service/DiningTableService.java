package com.restaurant.reservation.service;

import com.restaurant.reservation.dto.DiningTableDto;
import com.restaurant.reservation.dto.DiningTableRequest;
import com.restaurant.reservation.entity.DiningTable;
import com.restaurant.reservation.exception.BusinessException;
import com.restaurant.reservation.exception.ResourceNotFoundException;
import com.restaurant.reservation.repository.DiningTableRepository;
import com.restaurant.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiningTableService {

    private static final String MAINTENANCE = "MAINTENANCE";

    private final DiningTableRepository diningTableRepository;
    private final ReservationRepository reservationRepository;

    /**
     * Returns tables that are operational and have no overlapping reservation for the given window.
     */
    @Transactional(readOnly = true)
    public List<DiningTableDto> findAvailable(LocalDateTime dateTime, int durationMinutes, Integer guestCount) {
        LocalDateTime end = dateTime.plusMinutes(durationMinutes);

        return diningTableRepository.findByStatusNot(MAINTENANCE).stream()
                .filter(t -> guestCount == null || t.getCapacity() >= guestCount)
                .filter(t -> reservationRepository.findOverlapping(t.getId(), dateTime, end).isEmpty())
                .map(DiningTableDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DiningTableDto> findAll() {
        return diningTableRepository.findAll().stream().map(DiningTableDto::from).toList();
    }

    @Transactional
    public DiningTableDto create(DiningTableRequest request) {
        diningTableRepository.findByTableNumber(request.getTableNumber()).ifPresent(t -> {
            throw new BusinessException("Table number already exists");
        });
        DiningTable table = DiningTable.builder()
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity())
                .status(request.getStatus())
                .build();
        return DiningTableDto.from(diningTableRepository.save(table));
    }

    @Transactional
    public DiningTableDto update(Long id, DiningTableRequest request) {
        DiningTable table = diningTableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        table.setTableNumber(request.getTableNumber());
        table.setCapacity(request.getCapacity());
        table.setStatus(request.getStatus());
        return DiningTableDto.from(diningTableRepository.save(table));
    }

    @Transactional
    public void delete(Long id) {
        if (!diningTableRepository.existsById(id)) {
            throw new ResourceNotFoundException("Table not found");
        }
        diningTableRepository.deleteById(id);
    }
}
