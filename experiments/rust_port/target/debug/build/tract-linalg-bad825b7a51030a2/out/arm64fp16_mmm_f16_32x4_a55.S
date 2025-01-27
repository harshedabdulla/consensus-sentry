// vim: ft=arm

// x20..x27 are used, callee-preserved

// C tile regs: v16 to v31, (scratch)

// v8 is used, d8 (lower half) must preserved
// v0-v7 (scratch registers)
//  packed A buffering (2x8 values): alternating v0, v1 with v2, v3
//  packed B buffering (2x8 values): alternating v4, v5 with v6, v7

.text
.align 4


.global _arm64fp16_mmm_f16_32x4_a55_0_19_16
_arm64fp16_mmm_f16_32x4_a55_0_19_16:

    stp         x20, x21, [sp, #-16]!
    stp         x22, x23, [sp, #-16]!
    stp         x24, x25, [sp, #-16]!
    stp         x26, x27, [sp, #-16]!

    stp         d8, d9, [sp, #-16]!

// vim: ft=arm

.non_linear:
    sub         x0, x0, 40

.non_linear_loop:
    add         x0, x0, 40
    ldr         x2, [x0]

    mov         x4, #27

    cmp         x2, #27
    csel        x2, x2, x4, lt
    cmp         x2, #0
    csel        x2, x4, x2, lt

    adr         x3, .jmp_table
    add         x3, x3, x2, LSL#2
    br          x3

.jmp_table:

    b   .done

    b   .clear

    b   .scalar_min

    b   .scalar_max

    b   .scalar_add

    b   .scalar_mul

    b   .scalar_sub

    b   .scalar_sub_flipped

    b   .per_row_min

    b   .per_row_max

    b   .per_row_add

    b   .per_row_mul

    b   .per_row_sub

    b   .per_row_sub_flipped

    b   .per_col_min

    b   .per_col_max

    b   .per_col_add

    b   .per_col_mul

    b   .per_col_sub

    b   .per_col_sub_flipped

    b   .q_scale

    b   .q_shr

    b   .q_shl

    b   .add_unicast

    b   .add_row_col_products

    b   .store

    b   .add_mat_mul

    b   .unsupported

    add x0, x2, #4000
    b .return

.unsupported:
    mov         x0, #1
    b           .return

.done:
    mov         x0, 0
    b           .return



.add_mat_mul:
    ldr         x2, [x0, #24]       // b
    ldp         x3, x1, [x0, #8]    // k, a

    cmp         x3, #0
    beq         .non_linear_loop

    ld1         { v0.4s, v1.4s, v2.4s, v3.4s }, [ x1 ], #64
    ldr         d4, [x2], #8





    cmp         x3, #4
    blt         .packed_packed_loop_1

.p2align 4
.packed_packed_loop_4:
    
    
        // mul a: v0, v1, v2, v3 b: v4
// load a: v5(d5/x5), v6(d6,x6), v7(d7,x7), v8(d8, x8)
// load b: v9 as d9

fmla        v16.8h, v0.8h, v4.h[0]
ldr         d5, [x1], #8
fmla        v17.8h, v1.8h, v4.h[0]
ldr         d9, [x2], #8
fmla        v18.8h, v2.8h, v4.h[0]
ldr         x5, [x1], #8
fmla        v19.8h, v3.8h, v4.h[0]
fmla        v20.8h, v0.8h, v4.h[1]
ldr         d6, [x1], #8
fmla        v21.8h, v1.8h, v4.h[1]
ldr         x6, [x1], #8
fmla        v22.8h, v2.8h, v4.h[1]
ldr         d7, [x1], #8
fmla        v23.8h, v3.8h, v4.h[1]
ldr         x7, [x1], #8

fmla        v24.8h, v0.8h, v4.h[2]
ldr         d8, [x1], #8
fmla        v25.8h, v1.8h, v4.h[2]
ldr         x8, [x1], #8
fmla        v26.8h, v2.8h, v4.h[2]
ins         v5.d[1], x5
fmla        v27.8h, v3.8h, v4.h[2]
ins         v6.d[1], x6
fmla        v28.8h, v0.8h, v4.h[3]
ins         v7.d[1], x7
fmla        v29.8h, v1.8h, v4.h[3]
ins         v8.d[1], x8
fmla        v30.8h, v2.8h, v4.h[3]
ins         v9.d[1], x9
fmla        v31.8h, v3.8h, v4.h[3]

// mul a: v5, v6, v7, v8 b: v9
// load a: v0(d0/x5), v1(d1,x6), v2(d2,x7), v3(d3, x8)
// load b: v4 as d4

fmla        v16.8h, v5.8h, v9.h[0]
ldr         d0, [x1], #8
fmla        v17.8h, v6.8h, v9.h[0]
ldr         d4, [x2], #8
fmla        v18.8h, v7.8h, v9.h[0]
ldr         x5, [x1], #8
fmla        v19.8h, v8.8h, v9.h[0]
fmla        v20.8h, v5.8h, v9.h[1]
ldr         d1, [x1], #8
fmla        v21.8h, v6.8h, v9.h[1]
ldr         x6, [x1], #8
fmla        v22.8h, v7.8h, v9.h[1]
ldr         d2, [x1], #8
fmla        v23.8h, v8.8h, v9.h[1]
ldr         x7, [x1], #8

fmla        v24.8h, v5.8h, v9.h[2]
ldr         d3, [x1], #8
fmla        v25.8h, v6.8h, v9.h[2]
ldr         x8, [x1], #8
fmla        v26.8h, v7.8h, v9.h[2]
ins         v0.d[1], x5
fmla        v27.8h, v8.8h, v9.h[2]
ins         v1.d[1], x6
fmla        v28.8h, v5.8h, v9.h[3]
ins         v2.d[1], x7
fmla        v29.8h, v6.8h, v9.h[3]
ins         v3.d[1], x8
fmla        v30.8h, v7.8h, v9.h[3]
ins         v4.d[1], x9
fmla        v31.8h, v8.8h, v9.h[3]

    

    
    
        // mul a: v0, v1, v2, v3 b: v4
// load a: v5(d5/x5), v6(d6,x6), v7(d7,x7), v8(d8, x8)
// load b: v9 as d9

fmla        v16.8h, v0.8h, v4.h[0]
ldr         d5, [x1], #8
fmla        v17.8h, v1.8h, v4.h[0]
ldr         d9, [x2], #8
fmla        v18.8h, v2.8h, v4.h[0]
ldr         x5, [x1], #8
fmla        v19.8h, v3.8h, v4.h[0]
fmla        v20.8h, v0.8h, v4.h[1]
ldr         d6, [x1], #8
fmla        v21.8h, v1.8h, v4.h[1]
ldr         x6, [x1], #8
fmla        v22.8h, v2.8h, v4.h[1]
ldr         d7, [x1], #8
fmla        v23.8h, v3.8h, v4.h[1]
ldr         x7, [x1], #8

fmla        v24.8h, v0.8h, v4.h[2]
ldr         d8, [x1], #8
fmla        v25.8h, v1.8h, v4.h[2]
ldr         x8, [x1], #8
fmla        v26.8h, v2.8h, v4.h[2]
ins         v5.d[1], x5
fmla        v27.8h, v3.8h, v4.h[2]
ins         v6.d[1], x6
fmla        v28.8h, v0.8h, v4.h[3]
ins         v7.d[1], x7
fmla        v29.8h, v1.8h, v4.h[3]
ins         v8.d[1], x8
fmla        v30.8h, v2.8h, v4.h[3]
ins         v9.d[1], x9
fmla        v31.8h, v3.8h, v4.h[3]

// mul a: v5, v6, v7, v8 b: v9
// load a: v0(d0/x5), v1(d1,x6), v2(d2,x7), v3(d3, x8)
// load b: v4 as d4

fmla        v16.8h, v5.8h, v9.h[0]
ldr         d0, [x1], #8
fmla        v17.8h, v6.8h, v9.h[0]
ldr         d4, [x2], #8
fmla        v18.8h, v7.8h, v9.h[0]
ldr         x5, [x1], #8
fmla        v19.8h, v8.8h, v9.h[0]
fmla        v20.8h, v5.8h, v9.h[1]
ldr         d1, [x1], #8
fmla        v21.8h, v6.8h, v9.h[1]
ldr         x6, [x1], #8
fmla        v22.8h, v7.8h, v9.h[1]
ldr         d2, [x1], #8
fmla        v23.8h, v8.8h, v9.h[1]
ldr         x7, [x1], #8

fmla        v24.8h, v5.8h, v9.h[2]
ldr         d3, [x1], #8
fmla        v25.8h, v6.8h, v9.h[2]
ldr         x8, [x1], #8
fmla        v26.8h, v7.8h, v9.h[2]
ins         v0.d[1], x5
fmla        v27.8h, v8.8h, v9.h[2]
ins         v1.d[1], x6
fmla        v28.8h, v5.8h, v9.h[3]
ins         v2.d[1], x7
fmla        v29.8h, v6.8h, v9.h[3]
ins         v3.d[1], x8
fmla        v30.8h, v7.8h, v9.h[3]
ins         v4.d[1], x9
fmla        v31.8h, v8.8h, v9.h[3]

    


    sub x3, x3, #4
    cmp x3, #4
    bge .packed_packed_loop_4

    cmp x3, #0
    beq .non_linear_loop

.p2align 4
.packed_packed_loop_1:
    
    
fmla        v16.8h, v0.8h, v4.h[0]
fmla        v17.8h, v1.8h, v4.h[0]
fmla        v18.8h, v2.8h, v4.h[0]
fmla        v19.8h, v3.8h, v4.h[0]
fmla        v20.8h, v0.8h, v4.h[1]
fmla        v21.8h, v1.8h, v4.h[1]
fmla        v22.8h, v2.8h, v4.h[1]
fmla        v23.8h, v3.8h, v4.h[1]

fmla        v24.8h, v0.8h, v4.h[2]
fmla        v25.8h, v1.8h, v4.h[2]
fmla        v26.8h, v2.8h, v4.h[2]
fmla        v27.8h, v3.8h, v4.h[2]
fmla        v28.8h, v0.8h, v4.h[3]
fmla        v29.8h, v1.8h, v4.h[3]
fmla        v30.8h, v2.8h, v4.h[3]
fmla        v31.8h, v3.8h, v4.h[3]

ld1         { v0.8h, v1.8h, v2.8h, v3.8h }, [ x1 ], #64
ldr         d4, [x2], #8


    subs        x3, x3, #1
    bne .packed_packed_loop_1

    b   .non_linear_loop

// vim: ft=arm

// vim: ft=arm

.scalar_min:
    add         x2, x0, #8
    ld1         {v0.h}[0], [ x2 ]
    dup         v0.8h, v0.h[0]
    
        
            fmin       v16.8h, v0.8h, v16.8h
        
            fmin       v17.8h, v0.8h, v17.8h
        
            fmin       v18.8h, v0.8h, v18.8h
        
            fmin       v19.8h, v0.8h, v19.8h
        
            fmin       v20.8h, v0.8h, v20.8h
        
            fmin       v21.8h, v0.8h, v21.8h
        
            fmin       v22.8h, v0.8h, v22.8h
        
            fmin       v23.8h, v0.8h, v23.8h
        
            fmin       v24.8h, v0.8h, v24.8h
        
            fmin       v25.8h, v0.8h, v25.8h
        
            fmin       v26.8h, v0.8h, v26.8h
        
            fmin       v27.8h, v0.8h, v27.8h
        
            fmin       v28.8h, v0.8h, v28.8h
        
            fmin       v29.8h, v0.8h, v29.8h
        
            fmin       v30.8h, v0.8h, v30.8h
        
            fmin       v31.8h, v0.8h, v31.8h
        
    

    b           .non_linear_loop


// vim: ft=arm

.scalar_max:
    add         x2, x0, #8
    ld1         {v0.h}[0], [ x2 ]
    dup         v0.8h, v0.h[0]
    
        
            fmax       v16.8h, v0.8h, v16.8h
        
            fmax       v17.8h, v0.8h, v17.8h
        
            fmax       v18.8h, v0.8h, v18.8h
        
            fmax       v19.8h, v0.8h, v19.8h
        
            fmax       v20.8h, v0.8h, v20.8h
        
            fmax       v21.8h, v0.8h, v21.8h
        
            fmax       v22.8h, v0.8h, v22.8h
        
            fmax       v23.8h, v0.8h, v23.8h
        
            fmax       v24.8h, v0.8h, v24.8h
        
            fmax       v25.8h, v0.8h, v25.8h
        
            fmax       v26.8h, v0.8h, v26.8h
        
            fmax       v27.8h, v0.8h, v27.8h
        
            fmax       v28.8h, v0.8h, v28.8h
        
            fmax       v29.8h, v0.8h, v29.8h
        
            fmax       v30.8h, v0.8h, v30.8h
        
            fmax       v31.8h, v0.8h, v31.8h
        
    

    b           .non_linear_loop


// vim: ft=arm

.scalar_mul:
    add         x2, x0, #8
    ld1         {v0.h}[0], [ x2 ]
    dup         v0.8h, v0.h[0]
    
        
            fmul       v16.8h, v0.8h, v16.8h
        
            fmul       v17.8h, v0.8h, v17.8h
        
            fmul       v18.8h, v0.8h, v18.8h
        
            fmul       v19.8h, v0.8h, v19.8h
        
            fmul       v20.8h, v0.8h, v20.8h
        
            fmul       v21.8h, v0.8h, v21.8h
        
            fmul       v22.8h, v0.8h, v22.8h
        
            fmul       v23.8h, v0.8h, v23.8h
        
            fmul       v24.8h, v0.8h, v24.8h
        
            fmul       v25.8h, v0.8h, v25.8h
        
            fmul       v26.8h, v0.8h, v26.8h
        
            fmul       v27.8h, v0.8h, v27.8h
        
            fmul       v28.8h, v0.8h, v28.8h
        
            fmul       v29.8h, v0.8h, v29.8h
        
            fmul       v30.8h, v0.8h, v30.8h
        
            fmul       v31.8h, v0.8h, v31.8h
        
    

    b           .non_linear_loop


// vim: ft=arm

.scalar_add:
    add         x2, x0, #8
    ld1         {v0.h}[0], [ x2 ]
    dup         v0.8h, v0.h[0]
    
        
            fadd       v16.8h, v0.8h, v16.8h
        
            fadd       v17.8h, v0.8h, v17.8h
        
            fadd       v18.8h, v0.8h, v18.8h
        
            fadd       v19.8h, v0.8h, v19.8h
        
            fadd       v20.8h, v0.8h, v20.8h
        
            fadd       v21.8h, v0.8h, v21.8h
        
            fadd       v22.8h, v0.8h, v22.8h
        
            fadd       v23.8h, v0.8h, v23.8h
        
            fadd       v24.8h, v0.8h, v24.8h
        
            fadd       v25.8h, v0.8h, v25.8h
        
            fadd       v26.8h, v0.8h, v26.8h
        
            fadd       v27.8h, v0.8h, v27.8h
        
            fadd       v28.8h, v0.8h, v28.8h
        
            fadd       v29.8h, v0.8h, v29.8h
        
            fadd       v30.8h, v0.8h, v30.8h
        
            fadd       v31.8h, v0.8h, v31.8h
        
    

    b           .non_linear_loop


// vim: ft=arm

.scalar_sub:
    add         x2, x0, #8
    ld1         {v0.h}[0], [ x2 ]
    dup         v0.8h, v0.h[0]
    
        
            fsub       v16.8h, v0.8h, v16.8h
        
            fsub       v17.8h, v0.8h, v17.8h
        
            fsub       v18.8h, v0.8h, v18.8h
        
            fsub       v19.8h, v0.8h, v19.8h
        
            fsub       v20.8h, v0.8h, v20.8h
        
            fsub       v21.8h, v0.8h, v21.8h
        
            fsub       v22.8h, v0.8h, v22.8h
        
            fsub       v23.8h, v0.8h, v23.8h
        
            fsub       v24.8h, v0.8h, v24.8h
        
            fsub       v25.8h, v0.8h, v25.8h
        
            fsub       v26.8h, v0.8h, v26.8h
        
            fsub       v27.8h, v0.8h, v27.8h
        
            fsub       v28.8h, v0.8h, v28.8h
        
            fsub       v29.8h, v0.8h, v29.8h
        
            fsub       v30.8h, v0.8h, v30.8h
        
            fsub       v31.8h, v0.8h, v31.8h
        
    

    b           .non_linear_loop


// vim: ft=arm

.scalar_sub_flipped:
    add         x2, x0, #8
    ld1         {v0.h}[0], [ x2 ]
    dup         v0.8h, v0.h[0]
    
        
            fsub       v16.8h, v16.8h, v0.8h
        
            fsub       v17.8h, v17.8h, v0.8h
        
            fsub       v18.8h, v18.8h, v0.8h
        
            fsub       v19.8h, v19.8h, v0.8h
        
            fsub       v20.8h, v20.8h, v0.8h
        
            fsub       v21.8h, v21.8h, v0.8h
        
            fsub       v22.8h, v22.8h, v0.8h
        
            fsub       v23.8h, v23.8h, v0.8h
        
            fsub       v24.8h, v24.8h, v0.8h
        
            fsub       v25.8h, v25.8h, v0.8h
        
            fsub       v26.8h, v26.8h, v0.8h
        
            fsub       v27.8h, v27.8h, v0.8h
        
            fsub       v28.8h, v28.8h, v0.8h
        
            fsub       v29.8h, v29.8h, v0.8h
        
            fsub       v30.8h, v30.8h, v0.8h
        
            fsub       v31.8h, v31.8h, v0.8h
        
    

    b           .non_linear_loop



.clear:

    eor         v16.8b, v16.8b, v16.8b

    eor         v17.8b, v17.8b, v17.8b

    eor         v18.8b, v18.8b, v18.8b

    eor         v19.8b, v19.8b, v19.8b

    eor         v20.8b, v20.8b, v20.8b

    eor         v21.8b, v21.8b, v21.8b

    eor         v22.8b, v22.8b, v22.8b

    eor         v23.8b, v23.8b, v23.8b

    eor         v24.8b, v24.8b, v24.8b

    eor         v25.8b, v25.8b, v25.8b

    eor         v26.8b, v26.8b, v26.8b

    eor         v27.8b, v27.8b, v27.8b

    eor         v28.8b, v28.8b, v28.8b

    eor         v29.8b, v29.8b, v29.8b

    eor         v30.8b, v30.8b, v30.8b

    eor         v31.8b, v31.8b, v31.8b

    b .non_linear_loop

.q_scale:
.q_shl:
.q_shr:
    b .unsupported

// vim: ft=arm

// vim: ft=arm

.per_row_min:
    ldr         x2, [x0, #8]





    ldr         q0, [ x2 ], #16

    ldr         q1, [ x2 ], #16

    ldr         q2, [ x2 ], #16

    ldr         q3, [ x2 ], #16



    
        
        fmin v16.8h, v0.8h, v16.8h
    
        
        fmin v17.8h, v1.8h, v17.8h
    
        
        fmin v18.8h, v2.8h, v18.8h
    
        
        fmin v19.8h, v3.8h, v19.8h
    
        
        fmin v20.8h, v0.8h, v20.8h
    
        
        fmin v21.8h, v1.8h, v21.8h
    
        
        fmin v22.8h, v2.8h, v22.8h
    
        
        fmin v23.8h, v3.8h, v23.8h
    
        
        fmin v24.8h, v0.8h, v24.8h
    
        
        fmin v25.8h, v1.8h, v25.8h
    
        
        fmin v26.8h, v2.8h, v26.8h
    
        
        fmin v27.8h, v3.8h, v27.8h
    
        
        fmin v28.8h, v0.8h, v28.8h
    
        
        fmin v29.8h, v1.8h, v29.8h
    
        
        fmin v30.8h, v2.8h, v30.8h
    
        
        fmin v31.8h, v3.8h, v31.8h
    


b           .non_linear_loop

// vim: ft=arm

.per_row_max:
    ldr         x2, [x0, #8]





    ldr         q0, [ x2 ], #16

    ldr         q1, [ x2 ], #16

    ldr         q2, [ x2 ], #16

    ldr         q3, [ x2 ], #16



    
        
        fmax v16.8h, v0.8h, v16.8h
    
        
        fmax v17.8h, v1.8h, v17.8h
    
        
        fmax v18.8h, v2.8h, v18.8h
    
        
        fmax v19.8h, v3.8h, v19.8h
    
        
        fmax v20.8h, v0.8h, v20.8h
    
        
        fmax v21.8h, v1.8h, v21.8h
    
        
        fmax v22.8h, v2.8h, v22.8h
    
        
        fmax v23.8h, v3.8h, v23.8h
    
        
        fmax v24.8h, v0.8h, v24.8h
    
        
        fmax v25.8h, v1.8h, v25.8h
    
        
        fmax v26.8h, v2.8h, v26.8h
    
        
        fmax v27.8h, v3.8h, v27.8h
    
        
        fmax v28.8h, v0.8h, v28.8h
    
        
        fmax v29.8h, v1.8h, v29.8h
    
        
        fmax v30.8h, v2.8h, v30.8h
    
        
        fmax v31.8h, v3.8h, v31.8h
    


b           .non_linear_loop

// vim: ft=arm

.per_row_mul:
    ldr         x2, [x0, #8]





    ldr         q0, [ x2 ], #16

    ldr         q1, [ x2 ], #16

    ldr         q2, [ x2 ], #16

    ldr         q3, [ x2 ], #16



    
        
        fmul v16.8h, v0.8h, v16.8h
    
        
        fmul v17.8h, v1.8h, v17.8h
    
        
        fmul v18.8h, v2.8h, v18.8h
    
        
        fmul v19.8h, v3.8h, v19.8h
    
        
        fmul v20.8h, v0.8h, v20.8h
    
        
        fmul v21.8h, v1.8h, v21.8h
    
        
        fmul v22.8h, v2.8h, v22.8h
    
        
        fmul v23.8h, v3.8h, v23.8h
    
        
        fmul v24.8h, v0.8h, v24.8h
    
        
        fmul v25.8h, v1.8h, v25.8h
    
        
        fmul v26.8h, v2.8h, v26.8h
    
        
        fmul v27.8h, v3.8h, v27.8h
    
        
        fmul v28.8h, v0.8h, v28.8h
    
        
        fmul v29.8h, v1.8h, v29.8h
    
        
        fmul v30.8h, v2.8h, v30.8h
    
        
        fmul v31.8h, v3.8h, v31.8h
    


b           .non_linear_loop

// vim: ft=arm

.per_row_add:
    ldr         x2, [x0, #8]





    ldr         q0, [ x2 ], #16

    ldr         q1, [ x2 ], #16

    ldr         q2, [ x2 ], #16

    ldr         q3, [ x2 ], #16



    
        
        fadd v16.8h, v0.8h, v16.8h
    
        
        fadd v17.8h, v1.8h, v17.8h
    
        
        fadd v18.8h, v2.8h, v18.8h
    
        
        fadd v19.8h, v3.8h, v19.8h
    
        
        fadd v20.8h, v0.8h, v20.8h
    
        
        fadd v21.8h, v1.8h, v21.8h
    
        
        fadd v22.8h, v2.8h, v22.8h
    
        
        fadd v23.8h, v3.8h, v23.8h
    
        
        fadd v24.8h, v0.8h, v24.8h
    
        
        fadd v25.8h, v1.8h, v25.8h
    
        
        fadd v26.8h, v2.8h, v26.8h
    
        
        fadd v27.8h, v3.8h, v27.8h
    
        
        fadd v28.8h, v0.8h, v28.8h
    
        
        fadd v29.8h, v1.8h, v29.8h
    
        
        fadd v30.8h, v2.8h, v30.8h
    
        
        fadd v31.8h, v3.8h, v31.8h
    


b           .non_linear_loop

// vim: ft=arm

.per_row_sub:
    ldr         x2, [x0, #8]





    ldr         q0, [ x2 ], #16

    ldr         q1, [ x2 ], #16

    ldr         q2, [ x2 ], #16

    ldr         q3, [ x2 ], #16



    
        
        fsub v16.8h, v0.8h, v16.8h
    
        
        fsub v17.8h, v1.8h, v17.8h
    
        
        fsub v18.8h, v2.8h, v18.8h
    
        
        fsub v19.8h, v3.8h, v19.8h
    
        
        fsub v20.8h, v0.8h, v20.8h
    
        
        fsub v21.8h, v1.8h, v21.8h
    
        
        fsub v22.8h, v2.8h, v22.8h
    
        
        fsub v23.8h, v3.8h, v23.8h
    
        
        fsub v24.8h, v0.8h, v24.8h
    
        
        fsub v25.8h, v1.8h, v25.8h
    
        
        fsub v26.8h, v2.8h, v26.8h
    
        
        fsub v27.8h, v3.8h, v27.8h
    
        
        fsub v28.8h, v0.8h, v28.8h
    
        
        fsub v29.8h, v1.8h, v29.8h
    
        
        fsub v30.8h, v2.8h, v30.8h
    
        
        fsub v31.8h, v3.8h, v31.8h
    


b           .non_linear_loop

// vim: ft=arm

.per_row_sub_flipped:
    ldr         x2, [x0, #8]





    ldr         q0, [ x2 ], #16

    ldr         q1, [ x2 ], #16

    ldr         q2, [ x2 ], #16

    ldr         q3, [ x2 ], #16



    
        
        fsub v16.8h, v16.8h, v0.8h
    
        
        fsub v17.8h, v17.8h, v1.8h
    
        
        fsub v18.8h, v18.8h, v2.8h
    
        
        fsub v19.8h, v19.8h, v3.8h
    
        
        fsub v20.8h, v20.8h, v0.8h
    
        
        fsub v21.8h, v21.8h, v1.8h
    
        
        fsub v22.8h, v22.8h, v2.8h
    
        
        fsub v23.8h, v23.8h, v3.8h
    
        
        fsub v24.8h, v24.8h, v0.8h
    
        
        fsub v25.8h, v25.8h, v1.8h
    
        
        fsub v26.8h, v26.8h, v2.8h
    
        
        fsub v27.8h, v27.8h, v3.8h
    
        
        fsub v28.8h, v28.8h, v0.8h
    
        
        fsub v29.8h, v29.8h, v1.8h
    
        
        fsub v30.8h, v30.8h, v2.8h
    
        
        fsub v31.8h, v31.8h, v3.8h
    


b           .non_linear_loop



// vim: ft=arm

// vim: ft=arm

.per_col_min:
    ldr         x2, [x0, #8]







        ldr         d0, [ x2 ]


// mr:32 0 4


    dup v3.8h, v0.h[0]
    
        
        
            fmin v16.8h, v3.8h, v16.8h
        
    
        
        
            fmin v17.8h, v3.8h, v17.8h
        
    
        
        
            fmin v18.8h, v3.8h, v18.8h
        
    
        
        
            fmin v19.8h, v3.8h, v19.8h
        
    

    dup v3.8h, v0.h[1]
    
        
        
            fmin v20.8h, v3.8h, v20.8h
        
    
        
        
            fmin v21.8h, v3.8h, v21.8h
        
    
        
        
            fmin v22.8h, v3.8h, v22.8h
        
    
        
        
            fmin v23.8h, v3.8h, v23.8h
        
    

    dup v3.8h, v0.h[2]
    
        
        
            fmin v24.8h, v3.8h, v24.8h
        
    
        
        
            fmin v25.8h, v3.8h, v25.8h
        
    
        
        
            fmin v26.8h, v3.8h, v26.8h
        
    
        
        
            fmin v27.8h, v3.8h, v27.8h
        
    

    dup v3.8h, v0.h[3]
    
        
        
            fmin v28.8h, v3.8h, v28.8h
        
    
        
        
            fmin v29.8h, v3.8h, v29.8h
        
    
        
        
            fmin v30.8h, v3.8h, v30.8h
        
    
        
        
            fmin v31.8h, v3.8h, v31.8h
        
    


b           .non_linear_loop

// vim: ft=arm

.per_col_max:
    ldr         x2, [x0, #8]







        ldr         d0, [ x2 ]


// mr:32 0 4


    dup v3.8h, v0.h[0]
    
        
        
            fmax v16.8h, v3.8h, v16.8h
        
    
        
        
            fmax v17.8h, v3.8h, v17.8h
        
    
        
        
            fmax v18.8h, v3.8h, v18.8h
        
    
        
        
            fmax v19.8h, v3.8h, v19.8h
        
    

    dup v3.8h, v0.h[1]
    
        
        
            fmax v20.8h, v3.8h, v20.8h
        
    
        
        
            fmax v21.8h, v3.8h, v21.8h
        
    
        
        
            fmax v22.8h, v3.8h, v22.8h
        
    
        
        
            fmax v23.8h, v3.8h, v23.8h
        
    

    dup v3.8h, v0.h[2]
    
        
        
            fmax v24.8h, v3.8h, v24.8h
        
    
        
        
            fmax v25.8h, v3.8h, v25.8h
        
    
        
        
            fmax v26.8h, v3.8h, v26.8h
        
    
        
        
            fmax v27.8h, v3.8h, v27.8h
        
    

    dup v3.8h, v0.h[3]
    
        
        
            fmax v28.8h, v3.8h, v28.8h
        
    
        
        
            fmax v29.8h, v3.8h, v29.8h
        
    
        
        
            fmax v30.8h, v3.8h, v30.8h
        
    
        
        
            fmax v31.8h, v3.8h, v31.8h
        
    


b           .non_linear_loop

// vim: ft=arm

.per_col_mul:
    ldr         x2, [x0, #8]







        ldr         d0, [ x2 ]


// mr:32 0 4


    dup v3.8h, v0.h[0]
    
        
        
            fmul v16.8h, v3.8h, v16.8h
        
    
        
        
            fmul v17.8h, v3.8h, v17.8h
        
    
        
        
            fmul v18.8h, v3.8h, v18.8h
        
    
        
        
            fmul v19.8h, v3.8h, v19.8h
        
    

    dup v3.8h, v0.h[1]
    
        
        
            fmul v20.8h, v3.8h, v20.8h
        
    
        
        
            fmul v21.8h, v3.8h, v21.8h
        
    
        
        
            fmul v22.8h, v3.8h, v22.8h
        
    
        
        
            fmul v23.8h, v3.8h, v23.8h
        
    

    dup v3.8h, v0.h[2]
    
        
        
            fmul v24.8h, v3.8h, v24.8h
        
    
        
        
            fmul v25.8h, v3.8h, v25.8h
        
    
        
        
            fmul v26.8h, v3.8h, v26.8h
        
    
        
        
            fmul v27.8h, v3.8h, v27.8h
        
    

    dup v3.8h, v0.h[3]
    
        
        
            fmul v28.8h, v3.8h, v28.8h
        
    
        
        
            fmul v29.8h, v3.8h, v29.8h
        
    
        
        
            fmul v30.8h, v3.8h, v30.8h
        
    
        
        
            fmul v31.8h, v3.8h, v31.8h
        
    


b           .non_linear_loop

// vim: ft=arm

.per_col_add:
    ldr         x2, [x0, #8]







        ldr         d0, [ x2 ]


// mr:32 0 4


    dup v3.8h, v0.h[0]
    
        
        
            fadd v16.8h, v3.8h, v16.8h
        
    
        
        
            fadd v17.8h, v3.8h, v17.8h
        
    
        
        
            fadd v18.8h, v3.8h, v18.8h
        
    
        
        
            fadd v19.8h, v3.8h, v19.8h
        
    

    dup v3.8h, v0.h[1]
    
        
        
            fadd v20.8h, v3.8h, v20.8h
        
    
        
        
            fadd v21.8h, v3.8h, v21.8h
        
    
        
        
            fadd v22.8h, v3.8h, v22.8h
        
    
        
        
            fadd v23.8h, v3.8h, v23.8h
        
    

    dup v3.8h, v0.h[2]
    
        
        
            fadd v24.8h, v3.8h, v24.8h
        
    
        
        
            fadd v25.8h, v3.8h, v25.8h
        
    
        
        
            fadd v26.8h, v3.8h, v26.8h
        
    
        
        
            fadd v27.8h, v3.8h, v27.8h
        
    

    dup v3.8h, v0.h[3]
    
        
        
            fadd v28.8h, v3.8h, v28.8h
        
    
        
        
            fadd v29.8h, v3.8h, v29.8h
        
    
        
        
            fadd v30.8h, v3.8h, v30.8h
        
    
        
        
            fadd v31.8h, v3.8h, v31.8h
        
    


b           .non_linear_loop

// vim: ft=arm

.per_col_sub:
    ldr         x2, [x0, #8]







        ldr         d0, [ x2 ]


// mr:32 0 4


    dup v3.8h, v0.h[0]
    
        
        
            fsub v16.8h, v3.8h, v16.8h
        
    
        
        
            fsub v17.8h, v3.8h, v17.8h
        
    
        
        
            fsub v18.8h, v3.8h, v18.8h
        
    
        
        
            fsub v19.8h, v3.8h, v19.8h
        
    

    dup v3.8h, v0.h[1]
    
        
        
            fsub v20.8h, v3.8h, v20.8h
        
    
        
        
            fsub v21.8h, v3.8h, v21.8h
        
    
        
        
            fsub v22.8h, v3.8h, v22.8h
        
    
        
        
            fsub v23.8h, v3.8h, v23.8h
        
    

    dup v3.8h, v0.h[2]
    
        
        
            fsub v24.8h, v3.8h, v24.8h
        
    
        
        
            fsub v25.8h, v3.8h, v25.8h
        
    
        
        
            fsub v26.8h, v3.8h, v26.8h
        
    
        
        
            fsub v27.8h, v3.8h, v27.8h
        
    

    dup v3.8h, v0.h[3]
    
        
        
            fsub v28.8h, v3.8h, v28.8h
        
    
        
        
            fsub v29.8h, v3.8h, v29.8h
        
    
        
        
            fsub v30.8h, v3.8h, v30.8h
        
    
        
        
            fsub v31.8h, v3.8h, v31.8h
        
    


b           .non_linear_loop

// vim: ft=arm

.per_col_sub_flipped:
    ldr         x2, [x0, #8]







        ldr         d0, [ x2 ]


// mr:32 0 4


    dup v3.8h, v0.h[0]
    
        
        
            fsub v16.8h, v16.8h, v3.8h
        
    
        
        
            fsub v17.8h, v17.8h, v3.8h
        
    
        
        
            fsub v18.8h, v18.8h, v3.8h
        
    
        
        
            fsub v19.8h, v19.8h, v3.8h
        
    

    dup v3.8h, v0.h[1]
    
        
        
            fsub v20.8h, v20.8h, v3.8h
        
    
        
        
            fsub v21.8h, v21.8h, v3.8h
        
    
        
        
            fsub v22.8h, v22.8h, v3.8h
        
    
        
        
            fsub v23.8h, v23.8h, v3.8h
        
    

    dup v3.8h, v0.h[2]
    
        
        
            fsub v24.8h, v24.8h, v3.8h
        
    
        
        
            fsub v25.8h, v25.8h, v3.8h
        
    
        
        
            fsub v26.8h, v26.8h, v3.8h
        
    
        
        
            fsub v27.8h, v27.8h, v3.8h
        
    

    dup v3.8h, v0.h[3]
    
        
        
            fsub v28.8h, v28.8h, v3.8h
        
    
        
        
            fsub v29.8h, v29.8h, v3.8h
        
    
        
        
            fsub v30.8h, v30.8h, v3.8h
        
    
        
        
            fsub v31.8h, v31.8h, v3.8h
        
    


b           .non_linear_loop




.add_unicast:
    ldp         x5, x6, [x0, #8]
    ldp         x7, x8, [x0, #24]

    
        mov x4, x5
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v16.8h, v16.8h, v0.8h
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v17.8h, v17.8h, v0.8h
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v18.8h, v18.8h, v0.8h
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v19.8h, v19.8h, v0.8h
        
        add x5, x5, x7
    
        mov x4, x5
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v20.8h, v20.8h, v0.8h
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v21.8h, v21.8h, v0.8h
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v22.8h, v22.8h, v0.8h
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v23.8h, v23.8h, v0.8h
        
        add x5, x5, x7
    
        mov x4, x5
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v24.8h, v24.8h, v0.8h
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v25.8h, v25.8h, v0.8h
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v26.8h, v26.8h, v0.8h
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v27.8h, v27.8h, v0.8h
        
        add x5, x5, x7
    
        mov x4, x5
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v28.8h, v28.8h, v0.8h
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v29.8h, v29.8h, v0.8h
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v30.8h, v30.8h, v0.8h
        
            
                ld1 {v0.h}[0], [ x4 ], x6
            
                ld1 {v0.h}[1], [ x4 ], x6
            
                ld1 {v0.h}[2], [ x4 ], x6
            
                ld1 {v0.h}[3], [ x4 ], x6
            
                ld1 {v0.h}[4], [ x4 ], x6
            
                ld1 {v0.h}[5], [ x4 ], x6
            
                ld1 {v0.h}[6], [ x4 ], x6
            
                ld1 {v0.h}[7], [ x4 ], x6
            
            fadd v31.8h, v31.8h, v0.8h
        
        add x5, x5, x7
    

    b           .non_linear_loop

.add_row_col_products:
    ldr     x2, [x0, #8]
    ldr     x3, [x0, #16]

    ld1         { v0.8h, v1.8h, v2.8h, v3.8h }, [ x2 ]
    ldr         d4, [x3]

    fmla        v16.8h, v0.8h, v4.h[0]
    fmla        v17.8h, v1.8h, v4.h[0]
    fmla        v18.8h, v2.8h, v4.h[0]
    fmla        v19.8h, v3.8h, v4.h[0]
    fmla        v20.8h, v0.8h, v4.h[1]
    fmla        v21.8h, v1.8h, v4.h[1]
    fmla        v22.8h, v2.8h, v4.h[1]
    fmla        v23.8h, v3.8h, v4.h[1]

    fmla        v24.8h, v0.8h, v4.h[2]
    fmla        v25.8h, v1.8h, v4.h[2]
    fmla        v26.8h, v2.8h, v4.h[2]
    fmla        v27.8h, v3.8h, v4.h[2]
    fmla        v28.8h, v0.8h, v4.h[3]
    fmla        v29.8h, v1.8h, v4.h[3]
    fmla        v30.8h, v2.8h, v4.h[3]
    fmla        v31.8h, v3.8h, v4.h[3]

    b           .non_linear_loop

.store:
    ldp         x5, x6, [x0, #8]            // c base ptr, rsc
    ldp         x7, x8, [x0, #24]           // csc, item_size

    cmp         x6, #2
    bne           .store_strides_generic

    
        str q16, [ x5 ]
        str q17, [ x5, #16 ]
        str q18, [ x5, #32 ]
        str q19, [ x5, #48 ]
        add x5, x5, x7
    
        str q20, [ x5 ]
        str q21, [ x5, #16 ]
        str q22, [ x5, #32 ]
        str q23, [ x5, #48 ]
        add x5, x5, x7
    
        str q24, [ x5 ]
        str q25, [ x5, #16 ]
        str q26, [ x5, #32 ]
        str q27, [ x5, #48 ]
        add x5, x5, x7
    
        str q28, [ x5 ]
        str q29, [ x5, #16 ]
        str q30, [ x5, #32 ]
        str q31, [ x5, #48 ]
        add x5, x5, x7
    

    b           .non_linear_loop

.store_strides_generic:

    
        mov x4, x5
        
            
                st1 { v16.h }[0], [ x4 ], x6
            
                st1 { v16.h }[1], [ x4 ], x6
            
                st1 { v16.h }[2], [ x4 ], x6
            
                st1 { v16.h }[3], [ x4 ], x6
            
                st1 { v16.h }[4], [ x4 ], x6
            
                st1 { v16.h }[5], [ x4 ], x6
            
                st1 { v16.h }[6], [ x4 ], x6
            
                st1 { v16.h }[7], [ x4 ], x6
            
        
            
                st1 { v17.h }[0], [ x4 ], x6
            
                st1 { v17.h }[1], [ x4 ], x6
            
                st1 { v17.h }[2], [ x4 ], x6
            
                st1 { v17.h }[3], [ x4 ], x6
            
                st1 { v17.h }[4], [ x4 ], x6
            
                st1 { v17.h }[5], [ x4 ], x6
            
                st1 { v17.h }[6], [ x4 ], x6
            
                st1 { v17.h }[7], [ x4 ], x6
            
        
            
                st1 { v18.h }[0], [ x4 ], x6
            
                st1 { v18.h }[1], [ x4 ], x6
            
                st1 { v18.h }[2], [ x4 ], x6
            
                st1 { v18.h }[3], [ x4 ], x6
            
                st1 { v18.h }[4], [ x4 ], x6
            
                st1 { v18.h }[5], [ x4 ], x6
            
                st1 { v18.h }[6], [ x4 ], x6
            
                st1 { v18.h }[7], [ x4 ], x6
            
        
            
                st1 { v19.h }[0], [ x4 ], x6
            
                st1 { v19.h }[1], [ x4 ], x6
            
                st1 { v19.h }[2], [ x4 ], x6
            
                st1 { v19.h }[3], [ x4 ], x6
            
                st1 { v19.h }[4], [ x4 ], x6
            
                st1 { v19.h }[5], [ x4 ], x6
            
                st1 { v19.h }[6], [ x4 ], x6
            
                st1 { v19.h }[7], [ x4 ], x6
            
        
        add x5, x5, x7
    
        mov x4, x5
        
            
                st1 { v20.h }[0], [ x4 ], x6
            
                st1 { v20.h }[1], [ x4 ], x6
            
                st1 { v20.h }[2], [ x4 ], x6
            
                st1 { v20.h }[3], [ x4 ], x6
            
                st1 { v20.h }[4], [ x4 ], x6
            
                st1 { v20.h }[5], [ x4 ], x6
            
                st1 { v20.h }[6], [ x4 ], x6
            
                st1 { v20.h }[7], [ x4 ], x6
            
        
            
                st1 { v21.h }[0], [ x4 ], x6
            
                st1 { v21.h }[1], [ x4 ], x6
            
                st1 { v21.h }[2], [ x4 ], x6
            
                st1 { v21.h }[3], [ x4 ], x6
            
                st1 { v21.h }[4], [ x4 ], x6
            
                st1 { v21.h }[5], [ x4 ], x6
            
                st1 { v21.h }[6], [ x4 ], x6
            
                st1 { v21.h }[7], [ x4 ], x6
            
        
            
                st1 { v22.h }[0], [ x4 ], x6
            
                st1 { v22.h }[1], [ x4 ], x6
            
                st1 { v22.h }[2], [ x4 ], x6
            
                st1 { v22.h }[3], [ x4 ], x6
            
                st1 { v22.h }[4], [ x4 ], x6
            
                st1 { v22.h }[5], [ x4 ], x6
            
                st1 { v22.h }[6], [ x4 ], x6
            
                st1 { v22.h }[7], [ x4 ], x6
            
        
            
                st1 { v23.h }[0], [ x4 ], x6
            
                st1 { v23.h }[1], [ x4 ], x6
            
                st1 { v23.h }[2], [ x4 ], x6
            
                st1 { v23.h }[3], [ x4 ], x6
            
                st1 { v23.h }[4], [ x4 ], x6
            
                st1 { v23.h }[5], [ x4 ], x6
            
                st1 { v23.h }[6], [ x4 ], x6
            
                st1 { v23.h }[7], [ x4 ], x6
            
        
        add x5, x5, x7
    
        mov x4, x5
        
            
                st1 { v24.h }[0], [ x4 ], x6
            
                st1 { v24.h }[1], [ x4 ], x6
            
                st1 { v24.h }[2], [ x4 ], x6
            
                st1 { v24.h }[3], [ x4 ], x6
            
                st1 { v24.h }[4], [ x4 ], x6
            
                st1 { v24.h }[5], [ x4 ], x6
            
                st1 { v24.h }[6], [ x4 ], x6
            
                st1 { v24.h }[7], [ x4 ], x6
            
        
            
                st1 { v25.h }[0], [ x4 ], x6
            
                st1 { v25.h }[1], [ x4 ], x6
            
                st1 { v25.h }[2], [ x4 ], x6
            
                st1 { v25.h }[3], [ x4 ], x6
            
                st1 { v25.h }[4], [ x4 ], x6
            
                st1 { v25.h }[5], [ x4 ], x6
            
                st1 { v25.h }[6], [ x4 ], x6
            
                st1 { v25.h }[7], [ x4 ], x6
            
        
            
                st1 { v26.h }[0], [ x4 ], x6
            
                st1 { v26.h }[1], [ x4 ], x6
            
                st1 { v26.h }[2], [ x4 ], x6
            
                st1 { v26.h }[3], [ x4 ], x6
            
                st1 { v26.h }[4], [ x4 ], x6
            
                st1 { v26.h }[5], [ x4 ], x6
            
                st1 { v26.h }[6], [ x4 ], x6
            
                st1 { v26.h }[7], [ x4 ], x6
            
        
            
                st1 { v27.h }[0], [ x4 ], x6
            
                st1 { v27.h }[1], [ x4 ], x6
            
                st1 { v27.h }[2], [ x4 ], x6
            
                st1 { v27.h }[3], [ x4 ], x6
            
                st1 { v27.h }[4], [ x4 ], x6
            
                st1 { v27.h }[5], [ x4 ], x6
            
                st1 { v27.h }[6], [ x4 ], x6
            
                st1 { v27.h }[7], [ x4 ], x6
            
        
        add x5, x5, x7
    
        mov x4, x5
        
            
                st1 { v28.h }[0], [ x4 ], x6
            
                st1 { v28.h }[1], [ x4 ], x6
            
                st1 { v28.h }[2], [ x4 ], x6
            
                st1 { v28.h }[3], [ x4 ], x6
            
                st1 { v28.h }[4], [ x4 ], x6
            
                st1 { v28.h }[5], [ x4 ], x6
            
                st1 { v28.h }[6], [ x4 ], x6
            
                st1 { v28.h }[7], [ x4 ], x6
            
        
            
                st1 { v29.h }[0], [ x4 ], x6
            
                st1 { v29.h }[1], [ x4 ], x6
            
                st1 { v29.h }[2], [ x4 ], x6
            
                st1 { v29.h }[3], [ x4 ], x6
            
                st1 { v29.h }[4], [ x4 ], x6
            
                st1 { v29.h }[5], [ x4 ], x6
            
                st1 { v29.h }[6], [ x4 ], x6
            
                st1 { v29.h }[7], [ x4 ], x6
            
        
            
                st1 { v30.h }[0], [ x4 ], x6
            
                st1 { v30.h }[1], [ x4 ], x6
            
                st1 { v30.h }[2], [ x4 ], x6
            
                st1 { v30.h }[3], [ x4 ], x6
            
                st1 { v30.h }[4], [ x4 ], x6
            
                st1 { v30.h }[5], [ x4 ], x6
            
                st1 { v30.h }[6], [ x4 ], x6
            
                st1 { v30.h }[7], [ x4 ], x6
            
        
            
                st1 { v31.h }[0], [ x4 ], x6
            
                st1 { v31.h }[1], [ x4 ], x6
            
                st1 { v31.h }[2], [ x4 ], x6
            
                st1 { v31.h }[3], [ x4 ], x6
            
                st1 { v31.h }[4], [ x4 ], x6
            
                st1 { v31.h }[5], [ x4 ], x6
            
                st1 { v31.h }[6], [ x4 ], x6
            
                st1 { v31.h }[7], [ x4 ], x6
            
        
        add x5, x5, x7
    

    b           .non_linear_loop

.return:
    ldp         d8, d9, [sp], #16

    ldp         x26, x27, [sp], #16
    ldp         x24, x25, [sp], #16
    ldp         x22, x23, [sp], #16
    ldp         x20, x21, [sp], #16

    ret

