package com.restaurant.reservation.service;

import com.restaurant.reservation.dto.DiningTableDto;
import com.restaurant.reservation.dto.DiningTableFloorDto;
import com.restaurant.reservation.dto.DiningTableRequest;
import com.restaurant.reservation.entity.DiningTable;
import com.restaurant.reservation.exception.BusinessException;
import com.restaurant.reservation.exception.ResourceNotFoundException;
import com.restaurant.reservation.repository.DiningTableRepository;
import com.restaurant.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.reservation.dto.TableLayoutItem;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiningTableService {

    private static final String MAINTENANCE = "MAINTENANCE";

    private final DiningTableRepository diningTableRepository;
    private final ReservationRepository reservationRepository;
    private final HallService hallService;
    private final RealtimeEventPublisher realtimeEventPublisher;

    @Transactional(readOnly = true)
    public List<DiningTableDto> findByHall(
            Long hallId,
            LocalDateTime dateTime,
            Integer durationMinutes,
            Integer guestCount) {
        List<DiningTable> tables = diningTableRepository.findByHallIdOrderByTableNumberAsc(hallId);
        if (dateTime == null) {
            return tables.stream().map(DiningTableDto::from).toList();
        }
        int duration =
                durationMinutes != null && durationMinutes > 0 ? durationMinutes : 90;
        Set<Long> availableIds =
                findAvailable(hallId, dateTime, duration, guestCount).stream()
                        .map(DiningTableDto::getId)
                        .collect(Collectors.toSet());
        return tables.stream()
                .map(t -> DiningTableDto.from(t, availableIds.contains(t.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DiningTableDto> findAll() {
        return diningTableRepository.findAllWithHall().stream().map(DiningTableDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<DiningTableDto> findAvailable(
            Long hallId, LocalDateTime dateTime, int durationMinutes, Integer guestCount) {
        LocalDateTime end = dateTime.plusMinutes(durationMinutes);

        return diningTableRepository.findByHallIdAndStatusNot(hallId, MAINTENANCE).stream()
                .filter(t -> guestCount == null || t.getCapacity() >= guestCount)
                .filter(t -> reservationRepository.findOverlapping(t.getId(), dateTime, end).isEmpty())
                .map(DiningTableDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DiningTableFloorDto> findFloorStatus(
            Long hallId, LocalDateTime dateTime, int durationMinutes, Integer guestCount) {
        Set<Long> availableIds = findAvailable(hallId, dateTime, durationMinutes, guestCount).stream()
                .map(DiningTableDto::getId)
                .collect(Collectors.toSet());

        return diningTableRepository.findByHallIdOrderByTableNumberAsc(hallId).stream()
                .map(t -> DiningTableFloorDto.from(t, availableIds.contains(t.getId())))
                .toList();
    }

    @Transactional
    public DiningTableDto create(Long hallId, DiningTableRequest request) {
        if (diningTableRepository.existsByHallIdAndTableNumber(hallId, request.getTableNumber())) {
            throw new BusinessException("Table number already exists in this hall");
        }
        DiningTable table = DiningTable.builder()
                .hall(hallService.findEntity(hallId))
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity())
                .status(request.getStatus())
                .posX(request.getPosX() != null ? request.getPosX() : 100)
                .posY(request.getPosY() != null ? request.getPosY() : 100)
                .shape(request.getShape() != null ? request.getShape() : "circle")
                .build();
        DiningTable saved = diningTableRepository.save(table);
        realtimeEventPublisher.hallLayoutUpdated(hallId);
        return DiningTableDto.from(saved);
    }

    @Transactional
    public List<DiningTableDto> updateLayout(Long hallId, List<TableLayoutItem> items) {
        hallService.findEntity(hallId);
        List<DiningTableDto> updated = items.stream()
                .map(item -> {
                    DiningTable table = findEntity(item.getId());
                    if (!table.getHall().getId().equals(hallId)) {
                        throw new BusinessException("Table does not belong to this hall");
                    }
                    table.setPosX(item.getPosX());
                    table.setPosY(item.getPosY());
                    return DiningTableDto.from(diningTableRepository.save(table));
                })
                .toList();
        realtimeEventPublisher.hallLayoutUpdated(hallId);
        return updated;
    }

    @Transactional
    public DiningTableDto update(Long id, DiningTableRequest request) {
        DiningTable table = findEntity(id);
        if (table.getTableNumber() != request.getTableNumber()
                && diningTableRepository.existsByHallIdAndTableNumber(
                        table.getHall().getId(), request.getTableNumber())) {
            throw new BusinessException("Table number already exists in this hall");
        }
        table.setTableNumber(request.getTableNumber());
        table.setCapacity(request.getCapacity());
        table.setStatus(request.getStatus());
        table.setPosX(request.getPosX() != null ? request.getPosX() : table.getPosX());
        table.setPosY(request.getPosY() != null ? request.getPosY() : table.getPosY());
        table.setShape(request.getShape() != null ? request.getShape() : table.getShape());
        DiningTable saved = diningTableRepository.save(table);
        realtimeEventPublisher.hallLayoutUpdated(saved.getHall().getId());
        return DiningTableDto.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (reservationRepository.countByTableId(id) > 0) {
            throw new BusinessException(
                    "Cannot delete table with reservations. Cancel or complete bookings first.");
        }
        DiningTable table = findEntity(id);
        Long hallId = table.getHall().getId();
        diningTableRepository.delete(table);
        realtimeEventPublisher.hallLayoutUpdated(hallId);
    }

    DiningTable findEntity(Long id) {
        return diningTableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
    }
}
