import {Matrix} from '../modules/SwatchMatrix';
import {SwatchMapModel} from '../models/SwatchMapModel';

export const removeUndefinedWeightSwatches = (grid: Matrix.Grid | undefined) => {
    if (grid === undefined) return
    grid.columns.forEach(function (column, index) {
        let weightOptimizedSwatches = column.rows.filter((swatch) => {
            return swatch.weight !== undefined;
        });
        grid.columns[index].rows = weightOptimizedSwatches;
    });

    return grid;
};

export const mapSwatchesToGrid = (grid: Matrix.Grid | undefined, mapper: SwatchMapModel) => {
    if (grid === undefined) return
    grid.columns.forEach(function (column) {
        let neutralTargets = column.rows[12].isNeutral;
        let targets = mapper.newTargets(neutralTargets);

        column.rows.forEach(function (row, index) {
            // @ts-ignore: Object is possibly 'null'.
            row.weight = undefined;
            if (targets.includes(row.l_target)) {
                // @ts-ignore: Object is possibly 'null'.
                row.weight = mapper.weights()[index];
            }
        });

        //
        // The pinned may not slot neatly into the L*5 matrix. If defined
        // swatch is not present, then insert into matrix, replacing for closest match.
        //
        column.rows.filter((swatch) => {
            if (swatch.isPinned === true && swatch.weight === undefined) {
                let index = getClosestIndex(swatch, targets);
                // need to test if a .isUserDefined is in the slot!
                let testing = column.rows[index];
                if (testing.isUserDefined == false) {
                    swatch.weight = column.rows[index].weight;
                    // @ts-ignore: Object is possibly 'null'.
                    column.rows[index].weight = undefined;
                }
            }
        });

        //
        // The userDefinedSwatch may not slot neatly into the L*5 matrix. If defined
        // swatch is not present, then insert into matrix, replacing for closest match.
        //
        column.rows.filter((swatch) => {
            if (swatch.isUserDefined === true && swatch.weight === undefined) {
                let index = getClosestIndex(swatch, targets);
                swatch.weight = column.rows[index].weight;
                // @ts-ignore: Object is possibly 'null'.
                column.rows[index].weight = undefined;
            }
        });
    });

    return removeUndefinedWeightSwatches(grid)
};

export const getClosestIndex = (swatch: Matrix.Swatch, targets: Array<any>) => {
    let m = swatch.l_target === 85 ? -2.5 : 0;
    var closest = targets.reduce(function (prev, curr) {
        return Math.abs(curr - (swatch.lightness + m)) < Math.abs(prev - (swatch.lightness + m)) ? curr : prev;
    });
    return targets.indexOf(closest);
};

export const formatData = (data: any) => {
    let grid = JSON.parse(data) as Matrix.Grid;
    return grid;
};

export * as Mapper from '.';
