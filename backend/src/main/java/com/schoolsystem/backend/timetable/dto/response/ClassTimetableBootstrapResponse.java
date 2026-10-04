package com.schoolsystem.backend.timetable.dto.response;

import com.schoolsystem.backend.academic.dto.response.ClassSummaryDTO;
import java.util.List;

public record ClassTimetableBootstrapResponse(
        List<ClassSummaryDTO> classes,
        ClassTimetableResponse timetable
) {}
