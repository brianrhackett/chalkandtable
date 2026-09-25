export type ScheduleCsvRow = {
    awayTeam: string;
    homeTeam: string;
    date: string;
    week: number;
};

export type ScheduleCsvResult =
    | {
        success: true;
        rows: ScheduleCsvRow[];
    }
    | {
        success: false;
        errors: string[];
    };

const REQUIRED_HEADERS = [
    "away_team",
    "home_team",
    "date",
    "week",
];

export async function parseScheduleCsv(
    file: File
): Promise<ScheduleCsvResult> {
    const text = await file.text();

    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length < 2) {
        return {
            success: false,
            errors: ["The CSV does not contain any schedule rows."],
        };
    }

    const headers = lines[0]
        .split(",")
        .map((header) => header.trim().toLowerCase());

    const missingHeaders = REQUIRED_HEADERS.filter(
        (header) => !headers.includes(header)
    );

    if (missingHeaders.length > 0) {
        return {
            success: false,
            errors: [
                `Missing required columns: ${missingHeaders.join(", ")}.`,
            ],
        };
    }

    const awayTeamIndex = headers.indexOf("away_team");
    const homeTeamIndex = headers.indexOf("home_team");
    const dateIndex = headers.indexOf("date");
    const weekIndex = headers.indexOf("week");

    const rows: ScheduleCsvRow[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i]
            .split(",")
            .map((column) => column.trim());

        const rowNumber = i + 1;

        const awayTeam = columns[awayTeamIndex] ?? "";
        const homeTeam = columns[homeTeamIndex] ?? "";
        const date = columns[dateIndex] ?? "";
        const weekValue = columns[weekIndex] ?? "";

        if (!awayTeam) {
            errors.push(
                `Row ${rowNumber}: Away team is required.`
            );
        }

        if (!homeTeam) {
            errors.push(
                `Row ${rowNumber}: Home team is required.`
            );
        }

        if (
            awayTeam &&
            homeTeam &&
            awayTeam.toLowerCase() === homeTeam.toLowerCase()
        ) {
            errors.push(
                `Row ${rowNumber}: A team cannot play itself.`
            );
        }

        if (!date) {
            errors.push(
                `Row ${rowNumber}: Date is required.`
            );
        } else if (!isValidDate(date)) {
            errors.push(
                `Row ${rowNumber}: "${date}" is not a valid date. Use YYYY-MM-DD.`
            );
        }

        const week = Number(weekValue);

        if (
            !Number.isInteger(week) ||
            week < 1
        ) {
            errors.push(
                `Row ${rowNumber}: Week must be a positive whole number.`
            );
        }

        if (
            awayTeam &&
            homeTeam &&
            date &&
            isValidDate(date) &&
            Number.isInteger(week) &&
            week > 0
        ) {
            rows.push({
                awayTeam,
                homeTeam,
                date,
                week,
            });
        }
    }

    if (errors.length > 0) {
        return {
            success: false,
            errors,
        };
    }

    return {
        success: true,
        rows,
    };
}

function isValidDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value
        .split("-")
        .map(Number);

    const date = new Date(
        Date.UTC(year, month - 1, day)
    );

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}