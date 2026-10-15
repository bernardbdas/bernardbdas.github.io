/**
 * math-dictionary.ts — Mathematical Expressions & Variable Dictionary
 * Pre-renders mathematical equations using KaTeX and provides plain-English,
 * intuitive breakdowns of symbols for researchers and laypersons alike.
 */
import katex from 'katex';

export const renderMath = (latex: string, displayMode = false): string => {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
    });
  } catch (err) {
    console.error('KaTeX render error:', err);
    return latex;
  }
};

export interface MathVariable {
  id: string;
  symbol: string;
  symbolHtml: string;
  name: string;
  category: 'MODEL_STATE' | 'OPTIMIZATION' | 'PRIVACY_SECURITY' | 'DISTRIBUTION';
  laymanMeaning: string;
  formalMeaning: string;
  typicalValues: string;
}

export interface EquationVariableRef {
  symbol: string;
  symbolHtml: string;
  name: string;
  plainRole: string;
  technicalDef: string;
}

export interface MathEquation {
  id: string;
  name: string;
  latex: string;
  html: string;
  context: string;
  intuitiveSummary: string;
  variables: EquationVariableRef[];
}

// ── Master Variable Dictionary ───────────────────────────────────────────────
export const MATH_VARIABLES: MathVariable[] = [
  {
    id: 'w-weights',
    symbol: 'W',
    symbolHtml: renderMath('W'),
    name: 'Model Weights (Parameters)',
    category: 'MODEL_STATE',
    laymanMeaning:
      'The "memory synapses" of the neural network. Think of them like millions of tiny volume dials that adjust how strongly signals flow between artificial neurons.',
    formalMeaning:
      'High-dimensional parameter tensor or matrix defining linear transformations in deep neural layers.',
    typicalValues: 'Millions to billions of float16/float32 parameters',
  },
  {
    id: 'delta-w-orth',
    symbol: '\\Delta W_{\\text{orth}}',
    symbolHtml: renderMath('\\Delta W_{\\text{orth}}'),
    name: 'Orthogonalized Parameter Update',
    category: 'OPTIMIZATION',
    laymanMeaning:
      'The recommended adjustment to the model dials, but cleaned up so that all adjustment directions are perpendicular (orthogonal) and won’t step on each other’s toes.',
    formalMeaning:
      'Parameter delta matrix whose singular values are normalized to unity via polar decomposition.',
    typicalValues: 'Unit spectral norm: ||ΔW||₂ ≤ 1',
  },
  {
    id: 'ns5',
    symbol: '\\text{NS}_5',
    symbolHtml: renderMath('\\text{NS}_5'),
    name: 'Quintic Newton-Schulz Operator',
    category: 'OPTIMIZATION',
    laymanMeaning:
      'A super-fast mathematical stabilizer. It takes chaotic gradient numbers and smooths them out into clean, evenly balanced updates using only basic additions and multiplications.',
    formalMeaning:
      'Fifth-order polynomial matrix iteration approximating the matrix sign function to compute the polar factor without matrix inversion.',
    typicalValues: '5 iterations with fixed coefficients',
  },
  {
    id: 'mt-momentum',
    symbol: 'M_t',
    symbolHtml: renderMath('M_t'),
    name: 'Multi-Scale Momentum Accumulator',
    category: 'OPTIMIZATION',
    laymanMeaning:
      'A rolling memory of past update directions. Like a heavy rolling boulder that ignores tiny potholes and keeps rolling steadily along the downhill slope.',
    formalMeaning:
      'Exponentially decaying moving average of client gradient vectors across communication rounds.',
    typicalValues: 'Decay parameter β ∈ [0.9, 0.99]',
  },
  {
    id: 'eta-lr',
    symbol: '\\eta',
    symbolHtml: renderMath('\\eta'),
    name: 'Global Learning Rate (Step Size)',
    category: 'OPTIMIZATION',
    laymanMeaning:
      'The pace of learning. If it is too big, the model makes reckless leaps and crashes; if it is too tiny, training takes forever.',
    formalMeaning:
      'Scalar hyperparameter governing the step size taken along the optimization trajectory.',
    typicalValues: '10⁻⁴ to 10⁻¹ (e.g. 0.001)',
  },
  {
    id: 'w-mem',
    symbol: 'W_t^{(\\text{mem})}',
    symbolHtml: renderMath('W_t^{(\\text{mem})}'),
    name: 'Continual Synaptic Memory State',
    category: 'MODEL_STATE',
    laymanMeaning:
      'A specialized mental notepad inside the model that automatically absorbs new streaming information without overwriting old lessons.',
    formalMeaning:
      'Internal linear projection layer updated continuously at test time via self-supervised reconstruction objectives.',
    typicalValues: 'Hidden state dimension: d = 512–4096',
  },
  {
    id: 'eta-inner',
    symbol: '\\eta_{\\text{inner}}',
    symbolHtml: renderMath('\\eta_{\\text{inner}}'),
    name: 'Inner Meta-Learning Rate',
    category: 'OPTIMIZATION',
    laymanMeaning:
      'How fast the model’s short-term memory adapts when looking at a fresh stream of incoming data in real time.',
    formalMeaning:
      'Step size used for inner-loop gradient descent updates during test-time training (TTT).',
    typicalValues: '10⁻³ to 10⁻²',
  },
  {
    id: 'nabla-loss',
    symbol: '\\nabla L_{\\text{self}}',
    symbolHtml: renderMath('\\nabla L_{\\text{self}}'),
    name: 'Self-Supervised Loss Gradient',
    category: 'OPTIMIZATION',
    laymanMeaning:
      'The compass needle showing which direction the model should adjust its dials to better understand what it is currently looking at.',
    formalMeaning:
      'Vector of first-order partial derivatives of the self-supervised reconstruction objective with respect to memory parameters.',
    typicalValues: 'L₂ norm bounded via gradient clipping',
  },
  {
    id: 'epsilon-dp',
    symbol: '\\epsilon',
    symbolHtml: renderMath('\\epsilon'),
    name: 'Differential Privacy Budget (Epsilon)',
    category: 'PRIVACY_SECURITY',
    laymanMeaning:
      'The privacy shield strength. Lower epsilon means tighter security. It guarantees that someone inspecting the AI cannot figure out if any specific person’s data was used.',
    formalMeaning:
      'Upper bound on the log-probability ratio of model outputs between any two neighboring datasets differing by a single individual.',
    typicalValues: 'ε ∈ [0.5, 2.0] (strict privacy: ε ≤ 1.2)',
  },
  {
    id: 'delta-dp',
    symbol: '\\delta',
    symbolHtml: renderMath('\\delta'),
    name: 'Differential Privacy Failure Bound (Delta)',
    category: 'PRIVACY_SECURITY',
    laymanMeaning:
      'The microscopic margin of error. It is the one-in-a-million chance that the privacy shield has a tiny leak.',
    formalMeaning:
      'Probability of catastrophic privacy leakage where the ε-bound does not hold strictly.',
    typicalValues: 'δ ≪ 1/N, typically 10⁻⁵ (0.00001)',
  },
  {
    id: 'dirichlet-alpha',
    symbol: '\\alpha',
    symbolHtml: renderMath('\\alpha'),
    name: 'Dirichlet Concentration Parameter (Skew)',
    category: 'DISTRIBUTION',
    laymanMeaning:
      'The diversity meter. If α is high, every participant has an equal mix of data; if α is tiny (like 0.1), each participant has radically different, one-sided data.',
    formalMeaning:
      'Concentration parameter of the symmetric Dirichlet distribution modeling Non-IID class partition skew across clients.',
    typicalValues: 'α = ∞ (IID), α = 0.5 (moderate skew), α = 0.1 (extreme skew)',
  },
  {
    id: 'mu-prox',
    symbol: '\\mu',
    symbolHtml: renderMath('\\mu'),
    name: 'Proximal Regularization Coefficient',
    category: 'OPTIMIZATION',
    laymanMeaning:
      'A virtual leash that stops any local device from training too far away from the global consensus model.',
    formalMeaning:
      'Weight of the quadratic penalty term in FedProx restricting local drift from the server checkpoint.',
    typicalValues: 'μ ∈ [0.001, 1.0]',
  },
  {
    id: 'nk-n',
    symbol: '\\frac{n_k}{n}',
    symbolHtml: renderMath('\\frac{n_k}{n}'),
    name: 'Client Data Weighting Ratio',
    category: 'DISTRIBUTION',
    laymanMeaning:
      'Voting power. Participants with 10,000 samples get more say in the average than someone with only 10 samples.',
    formalMeaning: 'Proportion of total dataset size n contributed by client k (n_k / n).',
    typicalValues: 'Positive scalar summing to 1.0: Σ(n_k/n) = 1',
  },
];

// ── Interactive Equations Catalog ────────────────────────────────────────────
export const MATH_EQUATIONS: MathEquation[] = [
  {
    id: 'eq-fedm3',
    name: 'FedM3 Polar-Orthogonalized Muon Update',
    latex: '\\Delta W_{\\text{orth}} = \\text{NS}_5(M_t) \\cdot \\eta',
    html: renderMath('\\Delta W_{\\text{orth}} = \\text{NS}_5(M_t) \\cdot \\eta', true),
    context: 'Core #01 // Adaptive Federated Aggregation',
    intuitiveSummary:
      'Instead of letting model updates pull wildly in conflicting directions across different devices, FedM3 gathers the momentum of all devices and feeds it into a 5-step matrix stabilizer (NS₅). This forces the update matrix to have clean, normalized dimensions before scaling it by the learning rate (η), preventing model divergence under extreme real-world data differences.',
    variables: [
      {
        symbol: '\\Delta W_{\\text{orth}}',
        symbolHtml: renderMath('\\Delta W_{\\text{orth}}'),
        name: 'Normalized Weight Delta',
        plainRole: 'The resulting balanced change that will be applied to the neural network.',
        technicalDef: 'Spectral-norm bounded orthogonal matrix update.',
      },
      {
        symbol: '\\text{NS}_5',
        symbolHtml: renderMath('\\text{NS}_5'),
        name: '5-Step Newton-Schulz Iteration',
        plainRole: 'The matrix stabilizer that straightens out and balances the update directions.',
        technicalDef: 'Fifth-order polynomial approximation of the matrix sign function.',
      },
      {
        symbol: 'M_t',
        symbolHtml: renderMath('M_t'),
        name: 'Momentum Tensor',
        plainRole: 'The rolling history of past gradients that provides momentum.',
        technicalDef: 'Multi-scale momentum accumulator computed across participating clients.',
      },
      {
        symbol: '\\eta',
        symbolHtml: renderMath('\\eta'),
        name: 'Global Step Size',
        plainRole: 'The volume dial controlling how boldly the model updates each round.',
        technicalDef: 'Scalar global learning rate parameter.',
      },
    ],
  },
  {
    id: 'eq-cms-ttt',
    name: 'Continuous Memory System (CMS) Test-Time Update',
    latex:
      'W_t^{(\\text{mem})} = W_{t-1}^{(\\text{mem})} - \\eta_{\\text{inner}} \\nabla L_{\\text{self}}(x_t; W_{t-1}^{(\\text{mem})})',
    html: renderMath(
      'W_t^{(\\text{mem})} = W_{t-1}^{(\\text{mem})} - \\eta_{\\text{inner}} \\nabla L_{\\text{self}}(x_t; W_{t-1}^{(\\text{mem})})',
      true,
    ),
    context: 'Core #02 // Test-Time Training Continual Memory',
    intuitiveSummary:
      'Rather than freezing past knowledge or saving sensitive private data onto a hard drive, CMS updates an internal "memory pad" in real-time. Whenever a new piece of data (x_t) arrives, it takes a small self-supervised learning step (∇L_self) scaled by the inner speed (η_inner) to compress the new knowledge directly into synaptic connections.',
    variables: [
      {
        symbol: 'W_t^{(\\text{mem})}',
        symbolHtml: renderMath('W_t^{(\\text{mem})}'),
        name: 'Updated Synaptic Memory',
        plainRole: 'The model’s memory state after learning from the current streaming sample.',
        technicalDef: 'Hidden memory state matrix at sequential stream step t.',
      },
      {
        symbol: 'W_{t-1}^{(\\text{mem})}',
        symbolHtml: renderMath('W_{t-1}^{(\\text{mem})}'),
        name: 'Prior Synaptic Memory',
        plainRole: 'The model’s existing memory state before seeing the new sample.',
        technicalDef: 'Previous memory parameter state from step t-1.',
      },
      {
        symbol: '\\eta_{\\text{inner}}',
        symbolHtml: renderMath('\\eta_{\\text{inner}}'),
        name: 'Inner Learning Rate',
        plainRole: 'How quickly the model internalizes the immediate new signal.',
        technicalDef: 'Fast meta-learning step size parameter for test-time adaptation.',
      },
      {
        symbol: '\\nabla L_{\\text{self}}',
        symbolHtml: renderMath('\\nabla L_{\\text{self}}'),
        name: 'Reconstruction Gradient',
        plainRole: 'The compass pointing toward the best way to compress the incoming sample.',
        technicalDef: 'First derivative of the self-supervised reconstruction loss.',
      },
      {
        symbol: 'x_t',
        symbolHtml: renderMath('x_t'),
        name: 'Incoming Stream Input',
        plainRole: 'The live data sample (e.g. sensor or medical scan) arriving right now.',
        technicalDef: 'Unlabeled feature vector at sequential time index t.',
      },
    ],
  },
  {
    id: 'eq-dp-guarantee',
    name: 'Sample-Level Differential Privacy Guarantee',
    latex: '(\\epsilon = 1.2, \\; \\delta = 10^{-5})',
    html: renderMath('(\\epsilon = 1.2, \\; \\delta = 10^{-5})', true),
    context: 'Core #03 // HOPE-FL Cryptographic Compliance',
    intuitiveSummary:
      'A formal mathematical guarantee that proves privacy. Epsilon (1.2) ensures that the statistical difference between training with or without any individual person’s record is strictly bounded, while delta (0.00001) guarantees that the probability of any unexpected privacy breach is less than one in a hundred thousand.',
    variables: [
      {
        symbol: '\\epsilon',
        symbolHtml: renderMath('\\epsilon'),
        name: 'Privacy Loss Budget',
        plainRole: 'The strict cap on how much information can ever leak about any single record.',
        technicalDef: 'Maximum multiplicative divergence bound between output distributions.',
      },
      {
        symbol: '\\delta',
        symbolHtml: renderMath('\\delta'),
        name: 'Failure Probability',
        plainRole: 'The one-in-a-hundred-thousand safety margin for unexpected leaks.',
        technicalDef: 'Additive probability of privacy bound violation.',
      },
    ],
  },
  {
    id: 'eq-fedavg',
    name: 'FedAvg Canonical Federated Averaging',
    latex: 'w_{t+1} = \\sum_{k=1}^K \\frac{n_k}{n} w_{t+1}^k',
    html: renderMath('w_{t+1} = \\sum_{k=1}^K \\frac{n_k}{n} w_{t+1}^k', true),
    context: 'Benchmark Strategy // Baseline Aggregator',
    intuitiveSummary:
      'The founding equation of federated learning. Each participant (k) trains their own model locally and sends it back. The central coordinator then calculates a weighted average of all models, where participants with more data have proportionately more voting influence.',
    variables: [
      {
        symbol: 'w_{t+1}',
        symbolHtml: renderMath('w_{t+1}'),
        name: 'Next-Round Global Model',
        plainRole: 'The combined master model that will be sent back out to everyone.',
        technicalDef: 'Aggregated central model weights for communication round t+1.',
      },
      {
        symbol: 'K',
        symbolHtml: renderMath('K'),
        name: 'Total Number of Clients',
        plainRole: 'The total count of phones, hospitals, or edge nodes taking part.',
        technicalDef: 'Cardinality of participating client set in round t.',
      },
      {
        symbol: '\\frac{n_k}{n}',
        symbolHtml: renderMath('\\frac{n_k}{n}'),
        name: 'Data Fraction',
        plainRole: 'The percentage of the total pool of data owned by this specific participant.',
        technicalDef: 'Proportional sample weighting ratio for client k.',
      },
      {
        symbol: 'w_{t+1}^k',
        symbolHtml: renderMath('w_{t+1}^k'),
        name: 'Client Local Model',
        plainRole: 'The trained model parameters returned by participant k after local training.',
        technicalDef: 'Locally optimized parameter vector from client k.',
      },
    ],
  },
  {
    id: 'eq-fedprox',
    name: 'FedProx Proximal Leash Objective',
    latex: '\\min_w \\left\\{ F_k(w) + \\frac{\\mu}{2} \\|w - w^t\\|^2 \\right\\}',
    html: renderMath('\\min_w \\left\\{ F_k(w) + \\frac{\\mu}{2} \\|w - w^t\\|^2 \\right\\}', true),
    context: 'Benchmark Strategy // Regularized Drift Prevention',
    intuitiveSummary:
      'Adds an elastic leash to local training. If a local participant tries to train too far in its own private direction, the penalty term (μ/2 · ||w - w^t||²) acts like a rubber band pulling the model back toward the global consensus.',
    variables: [
      {
        symbol: 'F_k(w)',
        symbolHtml: renderMath('F_k(w)'),
        name: 'Local Objective Loss',
        plainRole: 'How well the model performs on the local participant’s own data.',
        technicalDef: 'Empirical risk function evaluated on client k dataset.',
      },
      {
        symbol: '\\mu',
        symbolHtml: renderMath('\\mu'),
        name: 'Proximal Leash Penalty',
        plainRole: 'The stiffness of the rubber band pulling the model toward the shared model.',
        technicalDef: 'Hyperparameter governing quadratic distance penalty.',
      },
      {
        symbol: '\\|w - w^t\\|^2',
        symbolHtml: renderMath('\\|w - w^t\\|^2'),
        name: 'Distance to Checkpoint',
        plainRole: 'How far the local model has drifted from the shared master model.',
        technicalDef: 'Squared Euclidean distance between local parameters and global checkpoint.',
      },
    ],
  },
  {
    id: 'eq-dirichlet',
    name: 'Dirichlet Heterogeneity Partitioning',
    latex: 'p_k \\sim \\text{Dir}(\\alpha)',
    html: renderMath('p_k \\sim \\text{Dir}(\\alpha)', true),
    context: 'Empirical Benchmark // Non-IID Class Partition',
    intuitiveSummary:
      'A statistical formula used to simulate realistic real-world chaos in AI benchmarks. It controls whether all hospitals have a well-balanced sample of medical cases, or if each hospital is forced to specialize in only one or two rare conditions.',
    variables: [
      {
        symbol: 'p_k',
        symbolHtml: renderMath('p_k'),
        name: 'Client Class Allocation',
        plainRole: 'The percentage breakdown of categories assigned to participant k.',
        technicalDef: 'Probability vector representing multinomial class proportions on client k.',
      },
      {
        symbol: '\\alpha',
        symbolHtml: renderMath('\\alpha'),
        name: 'Concentration Parameter',
        plainRole: 'The knob controlling how uneven or one-sided each participant’s data is.',
        technicalDef: 'Symmetric concentration parameter of the Dirichlet prior distribution.',
      },
    ],
  },
];
