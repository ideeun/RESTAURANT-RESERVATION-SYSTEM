package com.restaurant.reservation.service;

import com.restaurant.reservation.dto.CreateReservationRequest;
import com.restaurant.reservation.dto.ReservationDto;
import com.restaurant.reservation.dto.UpdateReservationStatusRequest;
import com.restaurant.reservation.entity.DiningTable;
import com.restaurant.reservation.entity.Reservation;
import com.restaurant.reservation.entity.ReservationStatus;
import com.restaurant.reservation.entity.User;
import com.restaurant.reservation.exception.BusinessException;
import com.restaurant.reservation.exception.ResourceNotFoundException;
import com.restaurant.reservation.repository.DiningTableRepository;
import com.restaurant.reservation.repository.ReservationRepository;
import com.restaurant.reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private static final String TABLE_AVAILABLE = "AVAILABLE";

    private final ReservationRepository reservationRepository;
    private final DiningTableRepository diningTableRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ReservationDto> getUserBookings(Long userId) {
        return reservationRepository.findByUserIdOrderByReservationTimeDesc(userId).stream()
                .map(ReservationDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getAllBookings() {
        return reservationRepository.findAllByOrderByReservationTimeDesc().stream()
                .map(ReservationDto::from)
                .toList();
    }

    @Transactional
    public ReservationDto createReservation(Long userId, CreateReservationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        DiningTable table = diningTableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        validateTableAvailable(table);
        validateGuestCapacity(request.getGuestCount(), table.getCapacity());

        LocalDateTime start = request.getReservationTime();
        LocalDateTime end = start.plusMinutes(request.getDuration());

        if (!reservationRepository.findOverlapping(table.getId(), start, end).isEmpty()) {
            throw new BusinessException("Table is already reserved for the selected time slot");
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .table(table)
                .reservationTime(start)
                .duration(request.getDuration())
                .guestCount(request.getGuestCount())
                .status(ReservationStatus.PENDING)
                .build();

        return ReservationDto.from(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationDto updateStatus(Long bookingId, UpdateReservationStatusRequest request) {
        Reservation reservation = reservationRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        reservation.setStatus(request.getStatus());
        return ReservationDto.from(reservationRepository.save(reservation));
    }

    private void validateTableAvailable(DiningTable table) {
        if (!TABLE_AVAILABLE.equalsIgnoreCase(table.getStatus())) {
            throw new BusinessException("Table is not available for booking (status: " + table.getStatus() + ")");
        }
    }

    private void validateGuestCapacity(int guestCount, int capacity) {
        if (guestCount > capacity) {
            throw new BusinessException(
                    "Guest count (" + guestCount + ") exceeds table capacity (" + capacity + ")");
        }
    }
}
