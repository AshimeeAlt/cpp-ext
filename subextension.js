(async function(Scratch) {
  if (!Scratch.extensions.unsandboxed) {
    throw new Error(`"Build" needs to be ran unsandboxed!`);
  }

  let wasm;
  // Utilities
  function get_memory() {
    return new Uint8Array(wasm.instance.exports.memory.buffer);
  }
  const decoder = new TextDecoder('utf-8');
  const encoder = new TextEncoder('utf-8');
  function charPtrToString(str) {
    const memory = get_memory();
    let length=0;
    for (; memory[str + length] !== 0 ;++length) {}
    return decoder.decode(memory.subarray(str, str + length));
  }
  function stringToCharPtr(str) {
    const data = encoder.encode(str + '\x00');
    const ptr = wasm.instance.exports.get_memory_for_string(data.length + 1);
    const memory = get_memory();
    memory.subarray(ptr).set(data);
    return ptr;
  }
  function freeCharPtr(ptr) {
    wasm.instance.exports.free_memory_for_string(ptr);
  }

  // Our dynamically added WASM (replaced __wasmOverride with the WASM)
  const WASM = new Uint8Array(/*__wasmOverride*/);

  // Setup object
  const importObject = {
    env: {
      print_string: function(str) {
        console.log(charPtrToString(str));
      },
      log(any) {
        console.log(any);
      },
    }
  };

  function Mini(extensionInfo, exports) {
    this.register = () => Scratch.extensions.register(this);
    this.getInfo = function() {
      return extensionInfo;
    };
    extensionInfo.blocks = [];
    this.addBlock = function(blockInfo, fn) {
      blockInfo.func = blockInfo?.func ?? blockInfo?.opcode;
      if (typeof fn === 'string') {
        fn = exports[fn];
      }
      this[blockInfo.func] = function(args) {
        return fn(...(Object.values(args)));
      };
      extensionInfo.blocks.push(blockInfo);
    }
  }

  // Run that WASM!
  WebAssembly.instantiate(WASM, importObject).then((obj) => {
    wasm = obj;
    const __extension = wasm.instance.exports;
    // Create our extension
    const extension = new Mini({
      id: '0znzwMadeInWASM',
      name: 'Runs under WASM',
    }, __extension);
    // Add our blocks
    extension.addBlock({
      opcode: 'add',
      text: '[_1_A] + [_2_B]',
      arguments: {
        _1_A: {type: Scratch.ArgumentType.NUMBER},
        _2_B: {type: Scratch.ArgumentType.NUMBER},
      },
      blockType: Scratch.BlockType.REPORTER,
    }, 'add');
    // Register the extension
    extension.register();
  });
})(Scratch);