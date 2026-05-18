package com.restaurant.reservation.service;

import com.restaurant.reservation.dto.HallDto;
import com.restaurant.reservation.dto.HallRequest;
import com.restaurant.reservation.entity.Hall;
import com.restaurant.reservation.exception.BusinessException;
import com.restaurant.reservation.exception.ResourceNotFoundException;
import com.restaurant.reservation.repository.DiningTableRepository;
import com.restaurant.reservation.repository.HallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HallService {

    private final HallRepository hallRepository;
    private final BranchService branchService;
    private final DiningTableRepository diningTableRepository;

    @Transactional(readOnly = true)
    public List<HallDto> findByBranch(Long branchId) {
        return hallRepository.findByBranchIdOrderByNameAsc(branchId).stream()
                .map(HallDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public HallDto getById(Long id) {
        return HallDto.from(findEntity(id));
    }

    @Transactional
    public HallDto create(Long branchId, HallRequest request) {
        Hall hall = Hall.builder()
                .branch(branchService.findEntity(branchId))
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return HallDto.from(hallRepository.save(hall));
    }

    @Transactional
    public HallDto update(Long id, HallRequest request) {
        Hall hall = findEntity(id);
        hall.setName(request.getName());
        hall.setDescription(request.getDescription());
        return HallDto.from(hallRepository.save(hall));
    }

    @Transactional
    public void delete(Long id) {
        if (!hallRepository.existsById(id)) {
            throw new ResourceNotFoundException("Hall not found");
        }
        if (!diningTableRepository.findByHallIdOrderByTableNumberAsc(id).isEmpty()) {
            throw new BusinessException("Cannot delete hall with tables. Remove tables first.");
        }
        hallRepository.deleteById(id);
    }

    Hall findEntity(Long id) {
        return hallRepository.findByIdWithBranch(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found"));
    }
}
