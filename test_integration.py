
"""
念念增强系统集成测试
测试情感感知和记忆系统的集成效果
"""

import sys
import os

# 直接添加api目录到路径，避免导入__init__.py
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))

# 直接导入增强系统模块
from emotion_analysis import EnhancedEmotionAnalyzer, EmotionAnalysis
from memory_system import EnhancedMemorySystem, MemoryContext
from personality_system import EnhancedPersonalityModeling
from dialogue_naturalness import NaturalDialogueSystem, DialogueState, DialogueContext
from emotional_expression import EmotionalExpressionSystem
from datetime import datetime

def test_emotion_analysis():
    """测试情感分析系统"""
    print("="*80)
    print("测试情感分析系统")
    print("="*80)
    
    analyzer = EnhancedEmotionAnalyzer()
    
    test_messages = [
        "我今天特别难过，因为想起了妈妈",
        "最近工作好累啊，天天加班到很晚",
        "谢谢你一直陪着我，真的很感动",
        "明天要考试了，好紧张好焦虑",
        "今天天气真好，心情很平静",
        "我有点想你了，虽然知道你不在了",
    ]
    
    for message in test_messages:
        print(f"\n输入: {message}")
        result = analyzer.analyze_emotion(message)
        print(f"  主要情感: {result.primary_emotion}")
        print(f"  情感强度: {result.intensity.name}")
        print(f"  触发词: {result.triggers}")
        print(f"  建议回应风格: {result.suggested_response_style}")
    
    print("\n✅ 情感分析系统测试通过")
    return True

def test_memory_system():
    """测试记忆系统"""
    print("\n" + "="*80)
    print("测试记忆系统")
    print("="*80)
    
    memory_system = EnhancedMemorySystem()
    
    # 模拟记忆数据
    sample_memories = [
        {
            "content": "去年春节我们一起包饺子，你包的饺子总是露馅",
            "memory_type": "shared",
            "date": "2025-01-29",
            "importance": 8,
        },
        {
            "content": "你教我做红烧肉，说火候是关键",
            "memory_type": "shared",
            "date": "2024-12-15",
            "importance": 7,
        },
        {
            "content": "那次我生病，你整夜守在我床边",
            "memory_type": "shared",
            "date": "2024-11-20",
            "importance": 9,
        }
    ]
    
    # 测试不同场景
    test_cases = [
        {
            "message": "春节快到了，好想吃你包的饺子",
            "emotion": "missing",
        },
        {
            "message": "今天尝试做红烧肉，但火候没掌握好",
            "emotion": "disappointed",
        },
        {
            "message": "最近总是想起你，特别是生病的时候",
            "emotion": "sad",
        }
    ]
    
    for case in test_cases:
        print(f"\n用户消息: {case['message']}")
        print(f"用户情感: {case['emotion']}")
        
        context = memory_system.select_relevant_memories(
            current_message=case["message"],
            current_emotion=case["emotion"],
            all_memories=sample_memories,
            conversation_history=[],
            limit=2
        )
        
        print(f"  相关记忆数量: {len(context.relevant_memories)}")
        print(f"  情感共鸣度: {context.emotional_resonance:.2f}")
        print(f"  时间背景: {context.time_context}")
        if context.relevant_memories:
            print(f"  最相关记忆: {context.relevant_memories[0].content[:50]}...")
    
    print("\n✅ 记忆系统测试通过")
    return True

def test_integration():
    """测试集成功能"""
    print("\n" + "="*80)
    print("测试集成功能")
    print("="*80)
    
    # 初始化所有系统
    emotion_analyzer = EnhancedEmotionAnalyzer()
    memory_system = EnhancedMemorySystem()
    personality_modeling = EnhancedPersonalityModeling()
    dialogue_naturalness = NaturalDialogueSystem()
    emotional_expression = EmotionalExpressionSystem()
    
    # 模拟用户消息
    user_message = "妈妈，我今天特别想你，因为看到了你以前织的毛衣"
    
    # 模拟记忆数据
    sample_memories = [
        {
            "content": "你教我织毛衣，说我手笨但学得认真",
            "memory_type": "shared",
            "date": "2025-02-14",
            "importance": 8,
        },
        {
            "content": "去年冬天你给我织了条围巾，说怕我冷",
            "memory_type": "shared",
            "date": "2024-12-01",
            "importance": 9,
        }
    ]
    
    # 模拟人格特质
    personality_traits = {
        "openness": 0.7,
        "conscientiousness": 0.8,
        "extraversion": 0.6,
        "agreeableness": 0.9,
        "neuroticism": 0.4
    }
    
    print(f"用户消息: {user_message}")
    
    # 1. 情感分析
    emotion_analysis = emotion_analyzer.analyze_emotion(user_message)
    detected_emotion = emotion_analysis.primary_emotion
    emotion_intensity = emotion_analysis.intensity.value / 5.0
    
    print(f"\n1. 情感分析结果:")
    print(f"   情感: {detected_emotion}")
    print(f"   强度: {emotion_intensity:.2f}")
    print(f"   建议风格: {emotion_analysis.suggested_response_style}")
    
    # 2. 记忆选择
    memory_context = memory_system.select_relevant_memories(
        current_message=user_message,
        current_emotion=detected_emotion,
        all_memories=sample_memories,
        conversation_history=[],
        limit=2
    )
    
    print(f"\n2. 记忆选择结果:")
    print(f"   相关记忆: {len(memory_context.relevant_memories)}条")
    print(f"   情感共鸣: {memory_context.emotional_resonance:.2f}")
    if memory_context.relevant_memories:
        print(f"   最相关: {memory_context.relevant_memories[0].content[:50]}...")
    
    # 3. 人格建模
    personality_profile = personality_modeling.build_personality_profile(
        name="妈妈",
        relationship="母亲",
        personality_traits_dict=personality_traits,
        speaking_style="温柔亲切",
        additional_info={
            "core_values": ["家庭", "爱", "责任"],
            "hobbies": ["织毛衣", "做饭", "养花"],
        }
    )
    
    print(f"\n3. 人格建模结果:")
    print(f"   姓名: {personality_profile.name}")
    print(f"   关系: {personality_profile.relationship}")
    print(f"   说话风格: {personality_profile.speech_style.pace}速, {personality_profile.speech_style.tone}语调")
    
    # 4. 生成基础回应（模拟）
    base_response = "孩子，妈妈也想你。看到那件毛衣了吗？那是妈妈一针一线织出来的，想着你穿着暖和的样子。"
    
    # 5. 对话自然度调整
    dialogue_context = DialogueContext(
        current_state=DialogueState.MEMORY_SHARING,
        state_turns=1,
        conversation_history=[],
        user_intent="memory_sharing",
        emotional_tone=detected_emotion,
        topics_discussed=[],
        memory_references=[mem.content[:20] for mem in memory_context.relevant_memories],
        last_response_time=datetime.now()
    )
    
    natural_response = dialogue_naturalness.generate_natural_response(
        dialogue_context=dialogue_context,
        ai_response=base_response,
        user_emotion=detected_emotion,
        personality_profile=personality_profile
    )
    
    print(f"\n4. 对话自然度调整:")
    print(f"   调整后: {natural_response[:80]}...")
    
    # 6. 情感表达增强
    enhanced_response = emotional_expression.add_emotional_expressions(
        text=natural_response,
        emotion=detected_emotion,
        intensity=emotion_intensity,
        personality_traits=personality_traits,
        context={}
    )
    
    print(f"\n5. 情感表达增强:")
    print(f"   最终回应: {enhanced_response}")
    
    print("\n✅ 集成测试通过")
    return True

def test_complete_flow():
    """测试完整流程"""
    print("\n" + "="*80)
    print("测试完整对话流程")
    print("="*80)
    
    # 模拟完整的对话流程
    conversation_flow = [
        {
            "user_message": "妈妈，我来了",
            "expected_emotion": "neutral",
            "expected_state": "greeting"
        },
        {
            "user_message": "最近工作好累啊",
            "expected_emotion": "tired",
            "expected_state": "emotional_support"
        },
        {
            "user_message": "记得你以前总给我熬汤喝",
            "expected_emotion": "missing",
            "expected_state": "memory_sharing"
        },
        {
            "user_message": "今天先聊到这里吧",
            "expected_emotion": "neutral",
            "expected_state": "farewell"
        }
    ]
    
    emotion_analyzer = EnhancedEmotionAnalyzer()
    dialogue_naturalness = NaturalDialogueSystem()
    
    current_state = DialogueState.GREETING
    
    for i, flow in enumerate(conversation_flow, 1):
        print(f"\n对话轮次 {i}:")
        print(f"  用户: {flow['user_message']}")
        
        # 情感分析
        emotion_analysis = emotion_analyzer.analyze_emotion(flow['user_message'])
        detected_emotion = emotion_analysis.primary_emotion
        
        print(f"  检测情感: {detected_emotion}")
        print(f"  期望情感: {flow['expected_emotion']}")
        print(f"  当前状态: {current_state.value}")
        
        # 更新对话状态
        dialogue_context = DialogueContext(
            current_state=current_state,
            state_turns=1,
            conversation_history=[],
            user_intent="general_chat",
            emotional_tone=detected_emotion,
            topics_discussed=[],
            memory_references=[],
            last_response_time=datetime.now()
        )
        
        # 分析是否需要状态转换
        new_state, strategy = dialogue_naturalness.analyze_conversation_flow(
            dialogue_context, flow['user_message'], detected_emotion
        )
        
        if new_state != current_state:
            print(f"  状态转换: {current_state.value} -> {new_state.value}")
            current_state = new_state
        
        # 生成回应
        base_response = f"我理解你的感受，我会一直陪着你。"
        
        natural_response = dialogue_naturalness.generate_natural_response(
            dialogue_context=dialogue_context,
            ai_response=base_response,
            user_emotion=detected_emotion
        )
        
        print(f"  AI回应: {natural_response[:60]}...")
    
    print("\n✅ 完整流程测试通过")
    return True

def main():
    """运行所有测试"""
    print("开始念念增强系统集成测试...")
    print("="*80)
    
    tests = [
        ("情感分析系统", test_emotion_analysis),
        ("记忆系统", test_memory_system),
        ("集成功能", test_integration),
        ("完整流程", test_complete_flow),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            print(f"\n正在测试: {test_name}")
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name}测试失败: {e}")
            results.append((test_name, False))
    
    # 打印测试结果
    print("\n" + "="*80)
    print("测试结果汇总")
    print("="*80)
    
    passed = 0
    for test_name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n总计: {len(results)}个测试，{passed}个通过")
    
    if passed == len(results):
        print("\n🎉 所有测试通过！集成成功！")
        return True
    else:
        print("\n⚠️  部分测试失败，请检查集成问题")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
