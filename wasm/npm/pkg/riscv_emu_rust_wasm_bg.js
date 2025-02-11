import * as wasm from './riscv_emu_rust_wasm_bg.wasm';

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachegetUint64Memory0 = null;
function getUint64Memory0() {
    if (cachegetUint64Memory0 === null || cachegetUint64Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint64Memory0 = new BigUint64Array(wasm.memory.buffer);
    }
    return cachegetUint64Memory0;
}

function passArray64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8);
    getUint64Memory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

const u32CvtShim = new Uint32Array(2);

const uint64CvtShim = new BigUint64Array(u32CvtShim.buffer);

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
* `WasmRiscv` is an interface between user JavaScript code and
* WebAssembly RISC-V emulator. The following code is example
* JavaScript user code.
*
* ```ignore
* // JavaScript code
* const riscv = WasmRiscv.new();
* // Setup program content binary
* riscv.setup_program(new Uint8Array(elfBuffer));
* // Setup filesystem content binary
* riscv.setup_filesystem(new Uint8Array(fsBuffer));
*
* // Emulator needs to break program regularly to handle input/output
* // because the emulator is currenlty designed to run in a single thread.
* // Once `SharedArrayBuffer` lands by default in major browsers
* // we would run input/output handler in another thread.
* const runCycles = () => {
*   // Run 0x100000 (or certain) cycles, handle input/out,
*   // and fire next cycles.
*   // Note: Evety instruction is completed in a cycle.
*   setTimeout(runCycles, 0);
*   riscv.run_cycles(0x100000);
*
*   // Output handling
*   while (true) {
*     const data = riscv.get_output();
*     if (data !== 0) {
*       // print data
*     } else {
*       break;
*     }
*   }
*
*   // Input handling. Assuming inputs holds
*   // input ascii data.
*   while (inputs.length > 0) {
*     riscv.put_input(inputs.shift());
*   }
* };
* runCycles();
* ```
*/
export class WasmRiscv {

    static __wrap(ptr) {
        const obj = Object.create(WasmRiscv.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmriscv_free(ptr);
    }
    /**
    * Creates a new `WasmRiscv`.
    * @returns {WasmRiscv}
    */
    static new() {
        var ret = wasm.wasmriscv_new();
        return WasmRiscv.__wrap(ret);
    }
    /**
    * Sets up program run by the program. This method is expected to be called
    * only once.
    *
    * # Arguments
    * * `content` Program binary
    * @param {Uint8Array} content
    */
    setup_program(content) {
        var ptr0 = passArray8ToWasm0(content, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.wasmriscv_setup_program(this.ptr, ptr0, len0);
    }
    /**
    * Loads symbols of program and adds them to symbol - virtual address
    * mapping in `Emulator`.
    *
    * # Arguments
    * * `content` Program binary
    * @param {Uint8Array} content
    */
    load_program_for_symbols(content) {
        var ptr0 = passArray8ToWasm0(content, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.wasmriscv_load_program_for_symbols(this.ptr, ptr0, len0);
    }
    /**
    * Sets up filesystem. Use this method if program (e.g. Linux) uses
    * filesystem. This method is expected to be called up to only once.
    *
    * # Arguments
    * * `content` File system content binary
    * @param {Uint8Array} content
    */
    setup_filesystem(content) {
        var ptr0 = passArray8ToWasm0(content, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.wasmriscv_setup_filesystem(this.ptr, ptr0, len0);
    }
    /**
    * Sets up device tree. The emulator has default device tree configuration.
    * If you want to override it, use this method. This method is expected to
    * to be called up to only once.
    *
    * # Arguments
    * * `content` DTB content binary
    * @param {Uint8Array} content
    */
    setup_dtb(content) {
        var ptr0 = passArray8ToWasm0(content, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.wasmriscv_setup_dtb(this.ptr, ptr0, len0);
    }
    /**
    * Runs program set by `setup_program()`. The emulator won't stop forever
    * unless [`riscv-tests`](https://github.com/riscv/riscv-tests) programs.
    * The emulator stops if program is `riscv-tests` program and it finishes.
    */
    run() {
        wasm.wasmriscv_run(this.ptr);
    }
    /**
    * Runs program set by `setup_program()` in `cycles` cycles.
    *
    * # Arguments
    * * `cycles`
    * @param {number} cycles
    */
    run_cycles(cycles) {
        wasm.wasmriscv_run_cycles(this.ptr, cycles);
    }
    /**
    * Runs program until breakpoints. Also known as debugger's continue command.
    * This method takes `max_cycles`. If the program doesn't hit any breakpoint
    * in `max_cycles` cycles this method returns `false`. Otherwise `true`.
    *
    * Even without this method, you can write the same behavior JavaScript code
    * as the following code. But JS-WASM bridge cost isn't ignorable now. So
    * this method has been introduced.
    *
    * ```ignore
    * const runUntilBreakpoints = (riscv, breakpoints, maxCycles) => {
    *   for (let i = 0; i < maxCycles; i++) {
    *     riscv.run_cycles(1);
    *     const pc = riscv.read_pc()
    *     if (breakpoints.includes(pc)) {
    *       return true;
    *     }
    *   }
    *   return false;
    * };
    * ```
    *
    * # Arguments
    * * `breakpoints` An array including breakpoint virtual addresses
    * * `max_cycles` See the above description
    * @param {BigUint64Array} breakpoints
    * @param {number} max_cycles
    * @returns {boolean}
    */
    run_until_breakpoints(breakpoints, max_cycles) {
        var ptr0 = passArray64ToWasm0(breakpoints, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.wasmriscv_run_until_breakpoints(this.ptr, ptr0, len0, max_cycles);
        return ret !== 0;
    }
    /**
    * Disassembles an instruction Program Counter points to.
    * Use `get_output()` to get the disassembled strings.
    */
    disassemble_next_instruction() {
        wasm.wasmriscv_disassemble_next_instruction(this.ptr);
    }
    /**
    * Loads eight-byte data from memory. Loading can cause an error or trap.
    * If an error or trap happens `error[0]` holds non-zero error code and
    * this method returns zero. Otherwise `error[0]` holds zero and this
    * method returns loaded data.
    *
    * # Arguments
    * * `address` eight-byte virtual address
    * * `error` If an error or trap happens error[0] holds non-zero.
    *    Otherwize zero.
    *   * 0: No error
    *   * 1: Page fault
    *   * 2: Invalid address (e.g. translated physical address points to out
    *        of valid memory address range)
    * @param {BigInt} address
    * @param {Uint8Array} error
    * @returns {BigInt}
    */
    load_doubleword(address, error) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            uint64CvtShim[0] = address;
            const low0 = u32CvtShim[0];
            const high0 = u32CvtShim[1];
            var ptr1 = passArray8ToWasm0(error, wasm.__wbindgen_malloc);
            var len1 = WASM_VECTOR_LEN;
            wasm.wasmriscv_load_doubleword(retptr, this.ptr, low0, high0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n2 = uint64CvtShim[0];
            return n2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            error.set(getUint8Memory0().subarray(ptr1 / 1, ptr1 / 1 + len1));
            wasm.__wbindgen_free(ptr1, len1 * 1);
        }
    }
    /**
    * Reads integer register content.
    *
    * # Arguments
    * * `reg` register number. Must be 0-31.
    * @param {number} reg
    * @returns {BigInt}
    */
    read_register(reg) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmriscv_read_register(retptr, this.ptr, reg);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = uint64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Reads Program Counter content.
    * @returns {BigInt}
    */
    read_pc() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmriscv_read_pc(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = uint64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Gets ascii code byte sent from the emulator to terminal.
    * The emulator holds output buffer inside. This method returns zero
    * if the output buffer is empty. So if you want to read all buffered
    * output content, repeatedly call this method until zero is returned.
    *
    * ```ignore
    * // JavaScript code
    * while (true) {
    *   const data = riscv.get_output();
    *   if (data !== 0) {
    *     // print data
    *   } else {
    *     break;
    *   }
    * }
    * ```
    * @returns {number}
    */
    get_output() {
        var ret = wasm.wasmriscv_get_output(this.ptr);
        return ret;
    }
    /**
    * Puts ascii code byte sent from terminal to the emulator.
    *
    * # Arguments
    * * `data` Ascii code byte
    * @param {number} data
    */
    put_input(data) {
        wasm.wasmriscv_put_input(this.ptr, data);
    }
    /**
    * Enables or disables page cache optimization.
    * Page cache optimization is an experimental feature.
    * Refer to [`Mmu`](../riscv_emu_rust/mmu/struct.Mmu.html) for the detail.
    *
    * # Arguments
    * * `enabled`
    * @param {boolean} enabled
    */
    enable_page_cache(enabled) {
        wasm.wasmriscv_enable_page_cache(this.ptr, enabled);
    }
    /**
    * Gets virtual address corresponding to symbol strings.
    *
    * # Arguments
    * * `s` Symbol strings
    * * `error` If symbol is not found error[0] holds non-zero.
    *    Otherwize zero.
    * @param {string} s
    * @param {Uint8Array} error
    * @returns {BigInt}
    */
    get_address_of_symbol(s, error) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            var ptr1 = passArray8ToWasm0(error, wasm.__wbindgen_malloc);
            var len1 = WASM_VECTOR_LEN;
            wasm.wasmriscv_get_address_of_symbol(retptr, this.ptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n2 = uint64CvtShim[0];
            return n2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            error.set(getUint8Memory0().subarray(ptr1 / 1, ptr1 / 1 + len1));
            wasm.__wbindgen_free(ptr1, len1 * 1);
        }
    }
}

export function __wbg_randomFillSync_64cc7d048f228ca8() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
}, arguments) };

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbg_getRandomValues_98117e9a7e993920() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

export function __wbg_process_2f24d6544ea7b200(arg0) {
    var ret = getObject(arg0).process;
    return addHeapObject(ret);
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    var ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbg_versions_6164651e75405d4a(arg0) {
    var ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

export function __wbg_node_4b517d861cbcb3bc(arg0) {
    var ret = getObject(arg0).node;
    return addHeapObject(ret);
};

export function __wbg_crypto_98fc271021c7d2ad(arg0) {
    var ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export function __wbg_msCrypto_a2cdb043d2bfe57f(arg0) {
    var ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export function __wbg_modulerequire_3440a4bcf44437db() { return handleError(function (arg0, arg1) {
    var ret = module.require(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_newnoargs_1a11e7e8c906996c(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_call_e91f71ddf1f45cff() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_object_clone_ref(arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbg_self_b4546ea7b590539e() { return handleError(function () {
    var ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_c279fea81f426a68() { return handleError(function () {
    var ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_038a6ea0ff17789f() { return handleError(function () {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_4f93ce884bcee597() { return handleError(function () {
    var ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_is_undefined(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbg_buffer_79a3294266d4e783(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_new_945397fb09fec0b8(arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_223873223acf6d07(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_68e13e7bbd918464(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};

export function __wbg_newwithlength_b7722b5594f1dc21(arg0) {
    var ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_subarray_466613921b2fc6db(arg0, arg1, arg2) {
    var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbindgen_is_string(arg0) {
    var ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    var ret = wasm.memory;
    return addHeapObject(ret);
};

