// Multivariate logistic regression coefficients for the CDC IVF Success
// Estimator. Six cumulative formula blocks (3 retrievals/transfers each).
// Source: https://www.cdc.gov/art/ivf-success-estimator/formulas_new.html

export type YesNo = "Yes" | "No";
export type Parity = "0" | "1" | "2+";

export interface DiagnosisCoeffs {
  Yes: number[];
  No: number[];
}

export interface ParityCoeffs {
  "0": number[];
  "1": number[];
  "2+": number[];
}

export interface FormulaBlock {
  intercept: number[];
  age: number[];
  age_power_coefficient?: number[];
  age_power_factor?: number[];
  BMI: number[];
  bmi_power_coefficient?: number[];
  bmi_power_factor?: number[];
  tubal?: DiagnosisCoeffs;
  male_factor?: DiagnosisCoeffs;
  endometriosis?: DiagnosisCoeffs;
  pco?: DiagnosisCoeffs;
  diminished_ovarian_reserve?: DiagnosisCoeffs;
  uterine?: DiagnosisCoeffs;
  other?: DiagnosisCoeffs;
  unexplained?: DiagnosisCoeffs;
  gravida: ParityCoeffs;
  previous_live_births: ParityCoeffs;
}

export type FormulaId =
  | "f1-3"
  | "f4-6"
  | "f7-8"
  | "f9-10"
  | "f11-13"
  | "f14-16";

export const FORMULAS: Record<FormulaId, FormulaBlock> = {
  "f1-3": {
    intercept: [-6.8392144, -6.8728775, -9.3153777],
    age: [0.3347309, 0.32463644, 0.41426281],
    age_power_coefficient: [-0.0003249, -0.0002999, -0.000356],
    age_power_factor: [2.763313, 2.768118, 2.764885],
    BMI: [0.06997997, 0.05290472, 0.06252898],
    bmi_power_coefficient: [-0.0015045, -0.0010872, -0.001282],
    bmi_power_factor: [2, 2, 2],
    tubal: { Yes: [0.09373152, -0.0219855, 0.04844661], No: [0, 0, 0] },
    male_factor: { Yes: [0.24104423, 0.12467683, 0.21219068], No: [0, 0, 0] },
    endometriosis: { Yes: [0.02773216, -0.0158729, -0.0654468], No: [0, 0, 0] },
    pco: { Yes: [0.27949598, 0.1327005, 0.15746829], No: [0, 0, 0] },
    diminished_ovarian_reserve: {
      Yes: [-0.5780511, -0.4814415, -0.3226484],
      No: [0, 0, 0],
    },
    uterine: { Yes: [-0.1354896, -0.1339263, -0.0465512], No: [0, 0, 0] },
    other: { Yes: [-0.1018557, 0.01660419, 0.09637834], No: [0, 0, 0] },
    unexplained: { Yes: [0.2252616, 0.09599927, 0.1290718], No: [0, 0, 0] },
    gravida: {
      "0": [0, 0, 0],
      "1": [0.03514055, 0.03170167, 0.08132467],
      "2+": [-0.0059006, 0.00935556, -0.0338819],
    },
    previous_live_births: {
      "0": [0, 0, 0],
      "1": [0.15787934, 0.06422726, -0.0269845],
      "2+": [0.03077479, -0.0814083, -0.1761415],
    },
  },
  "f4-6": {
    intercept: [-7.5545223, -7.2779142, -9.4264037],
    age: [0.37931798, 0.35034389, 0.42699089],
    age_power_coefficient: [-0.0003752, -0.0003308, -0.0003753],
    age_power_factor: [2.763313, 2.768118, 2.764885],
    BMI: [0.08057661, 0.05271285, 0.06305985],
    bmi_power_coefficient: [-0.0015304, -0.0010342, -0.0012397],
    bmi_power_factor: [2, 2, 2],
    gravida: {
      "0": [0, 0, 0],
      "1": [0.02240271, 0.017446, 0.07047497],
      "2+": [-0.054699, -0.012032, -0.049649],
    },
    previous_live_births: {
      "0": [0, 0, 0],
      "1": [0.16421628, 0.07632398, -0.0177138],
      "2+": [0.05435658, -0.0482572, -0.1355878],
    },
  },
  "f7-8": {
    intercept: [-8.102508, -9.0304669, -5.7454969],
    age: [0.37506646, 0.42590102, 0.25449304],
    age_power_coefficient: [-0.0003171, -0.0003287, -0.0002903],
    age_power_factor: [2.784619, 2.796098, 2.742756],
    BMI: [0.04565965, 0.0128256, 0.06342897],
    bmi_power_coefficient: [-0.0008793, -0.0003694, -0.0012519],
    bmi_power_factor: [2, 2, 2],
    tubal: { Yes: [0.06858044, 0.00738291, 0.03490097], No: [0, 0, 0] },
    male_factor: { Yes: [0.23958731, 0.17753606, 0.12536463], No: [0, 0, 0] },
    endometriosis: { Yes: [-0.0128023, -0.1452422, -0.0209873], No: [0, 0, 0] },
    pco: { Yes: [0.27559287, 0.16601024, 0.26269293], No: [0, 0, 0] },
    diminished_ovarian_reserve: {
      Yes: [-0.4806452, -0.419979, -0.4216823],
      No: [0, 0, 0],
    },
    uterine: { Yes: [-0.1649105, -0.1653948, -0.0167548], No: [0, 0, 0] },
    other: { Yes: [-0.0770044, 0.0711429, 0.03805639], No: [0, 0, 0] },
    unexplained: { Yes: [0.18150326, 0.088662, -0.0481326], No: [0, 0, 0] },
    gravida: {
      "0": [0, 0, 0],
      "1": [0.15884291, 0.16681453, 0.10718096],
      "2+": [0.16420575, 0.28062882, 0.3043113],
    },
    previous_live_births: {
      "0": [0, 0, 0],
      "1": [0.32698183, 0.12700903, 0.06640623],
      "2+": [0.21325721, -0.061565, 0.01807376],
    },
  },
  "f9-10": {
    intercept: [-8.641603, -9.4181786, -6.33631],
    age: [0.40532864, 0.44433217, 0.28404854],
    age_power_coefficient: [-0.0003513, -0.0003502, -0.0003236],
    age_power_factor: [2.784619, 2.796098, 2.742756],
    BMI: [0.0534427, 0.01867522, 0.06118169],
    bmi_power_coefficient: [-0.0009225, -0.0003935, -0.0011247],
    bmi_power_factor: [2, 2, 2],
    gravida: {
      "0": [0, 0, 0],
      "1": [0.17347309, 0.17540746, 0.12900389],
      "2+": [0.17098727, 0.28988103, 0.33914138],
    },
    previous_live_births: {
      "0": [0, 0, 0],
      "1": [0.36910534, 0.16172879, 0.08720452],
      "2+": [0.25715519, 0.00143887, 0.08806027],
    },
  },
  "f11-13": {
    intercept: [-0.4033333, -1.3339892, 0.47327874],
    age: [0.02185135, 0.08801244, -0.007758],
    age_power_coefficient: [-8.7e-5, -0.0005611, 0],
    age_power_factor: [2.377287, 2.212801, 2.212801],
    BMI: [0.03918024, -0.0188403, -0.0058567],
    bmi_power_coefficient: [-0.0008828, 0.00010807, -0.0004581],
    bmi_power_factor: [2, 2, 2],
    tubal: { Yes: [-0.2662897, -0.3903679, 0.0763259], No: [0, 0, 0] },
    male_factor: { Yes: [-0.0508467, 0.00174282, -0.0700194], No: [0, 0, 0] },
    endometriosis: { Yes: [-0.0203064, 0.06840972, -0.0717694], No: [0, 0, 0] },
    pco: { Yes: [0.09520576, -0.2973461, -0.025297], No: [0, 0, 0] },
    diminished_ovarian_reserve: {
      Yes: [-0.0550674, 0.00053078, -0.2083672],
      No: [0, 0, 0],
    },
    uterine: { Yes: [-0.1485842, -0.169886, -0.0608922], No: [0, 0, 0] },
    other: { Yes: [-0.024112, 0.14533614, -0.0558357], No: [0, 0, 0] },
    unexplained: { Yes: [-0.1974379, -0.1887531, -0.1287295], No: [0, 0, 0] },
    gravida: {
      "0": [0, 0, 0],
      "1": [-0.0980307, -0.0441317, 0.07832513],
      "2+": [-0.1001531, -0.0551906, -0.1893451],
    },
    previous_live_births: {
      "0": [0, 0, 0],
      "1": [0.06581205, 0.01557833, 0.15345989],
      "2+": [0.05371457, -0.0308413, 0.17986175],
    },
  },
  "f14-16": {
    intercept: [-0.20316, -0.9168211, 0.40239489],
    age: [0.012644, 0.07070459, -0.0110165],
    age_power_coefficient: [-6e-5, -0.0004704, 0],
    age_power_factor: [2.377287, 2.212801, 2.212801],
    BMI: [0.032267, -0.0205248, -0.0037352],
    bmi_power_coefficient: [-0.00084, 9.42e-5, -0.0004848],
    bmi_power_factor: [2, 2, 2],
    gravida: {
      "0": [0, 0, 0],
      "1": [-0.11476, -0.0719338, 0.0511042],
      "2+": [-0.11943, -0.0838426, -0.2074111],
    },
    previous_live_births: {
      "0": [0, 0, 0],
      "1": [0.074343, 0.02804825, 0.14692909],
      "2+": [0.039223, -0.0672634, 0.22919021],
    },
  },
};
