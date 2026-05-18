package com.restaurant.reservation.service;

import com.restaurant.reservation.dto.BranchDto;
import com.restaurant.reservation.dto.BranchRequest;
import com.restaurant.reservation.entity.Branch;
import com.restaurant.reservation.exception.ResourceNotFoundException;
import com.restaurant.reservation.repository.BranchRepository;
import com.restaurant.reservation.repository.HallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final HallRepository hallRepository;

    @Transactional(readOnly = true)
    public List<BranchDto> findAll() {
        return branchRepository.findAll().stream().map(BranchDto::from).toList();
    }

    @Transactional(readOnly = true)
    public BranchDto getById(Long id) {
        return BranchDto.from(findEntity(id));
    }

    @Transactional
    public BranchDto create(BranchRequest request) {
        Branch branch = Branch.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .build();
        return BranchDto.from(branchRepository.save(branch));
    }

    @Transactional
    public BranchDto update(Long id, BranchRequest request) {
        Branch branch = findEntity(id);
        branch.setName(request.getName());
        branch.setAddress(request.getAddress());
        branch.setPhone(request.getPhone());
        return BranchDto.from(branchRepository.save(branch));
    }

    @Transactional
    public void delete(Long id) {
        if (!branchRepository.existsById(id)) {
            throw new ResourceNotFoundException("Branch not found");
        }
        if (!hallRepository.findByBranchIdOrderByNameAsc(id).isEmpty()) {
            throw new com.restaurant.reservation.exception.BusinessException(
                    "Cannot delete branch with halls. Remove halls first.");
        }
        branchRepository.deleteById(id);
    }

    Branch findEntity(Long id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
    }
}
